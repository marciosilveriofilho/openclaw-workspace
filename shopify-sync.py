#!/usr/bin/env python3
"""
Sync Shopify → Supabase
Puxa clientes, pedidos e carrinhos abandonados
"""

import requests
import json
import time
from datetime import datetime

SHOPIFY_TOKEN = "SHOPIFY_TOKEN_AQUI"
SHOPIFY_URL = "https://loja-mariana-amaral.myshopify.com/admin/api/2024-01"
SHOPIFY_HEADERS = {"X-Shopify-Access-Token": SHOPIFY_TOKEN}

SUPABASE_URL = "https://wzuawfgckwpexgyhlzsy.supabase.co"
SUPABASE_KEY = "SUPABASE_KEY_AQUI"
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def upsert_supabase(table, data):
    """Insere ou atualiza no Supabase"""
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=SUPABASE_HEADERS,
        json=data
    )
    return r.status_code

def sync_clientes(limit=250, paginas=5):
    """Sync clientes do Shopify"""
    print(f"\n📥 Sincronizando clientes (até {limit*paginas})...")
    page_info = None
    total = 0
    
    for pagina in range(paginas):
        url = f"{SHOPIFY_URL}/customers.json?limit={limit}"
        if page_info:
            url += f"&page_info={page_info}"
        
        r = requests.get(url, headers=SHOPIFY_HEADERS)
        data = r.json()
        clientes = data.get("customers", [])
        
        if not clientes:
            break
        
        batch = []
        for c in clientes:
            addr = c.get("default_address") or {}
            batch.append({
                "id": c["id"],
                "email": c.get("email"),
                "nome": f"{c.get('first_name','')} {c.get('last_name','')}".strip(),
                "telefone": c.get("phone"),
                "cidade": addr.get("city"),
                "estado": addr.get("province"),
                "pais": addr.get("country"),
                "total_pedidos": c.get("orders_count", 0),
                "total_gasto": float(c.get("total_spent", 0)),
                "criado_em": c.get("created_at"),
                "atualizado_em": c.get("updated_at"),
                "tags": c.get("tags")
            })
        
        status = upsert_supabase("shopify_clientes", batch)
        total += len(batch)
        print(f"  Página {pagina+1}: {len(batch)} clientes → Status {status}")
        
        # Verifica próxima página
        link = r.headers.get("Link", "")
        if 'rel="next"' in link:
            import re
            match = re.search(r'page_info=([^&>]+).*?rel="next"', link)
            if match:
                page_info = match.group(1)
        else:
            break
        
        time.sleep(0.5)  # Rate limit
    
    print(f"✅ {total} clientes sincronizados!")
    return total

def sync_pedidos(limit=250, paginas=5):
    """Sync pedidos do Shopify"""
    print(f"\n📦 Sincronizando pedidos (até {limit*paginas})...")
    page_info = None
    total = 0
    
    for pagina in range(paginas):
        url = f"{SHOPIFY_URL}/orders.json?limit={limit}&status=any"
        if page_info:
            url += f"&page_info={page_info}"
        
        r = requests.get(url, headers=SHOPIFY_HEADERS)
        data = r.json()
        pedidos = data.get("orders", [])
        
        if not pedidos:
            break
        
        batch = []
        for p in pedidos:
            batch.append({
                "id": p["id"],
                "cliente_id": p.get("customer", {}).get("id"),
                "email": p.get("email"),
                "total": float(p.get("total_price", 0)),
                "status": p.get("fulfillment_status"),
                "status_pagamento": p.get("financial_status"),
                "criado_em": p.get("created_at"),
                "produtos_count": len(p.get("line_items", []))
            })
        
        status = upsert_supabase("shopify_pedidos", batch)
        total += len(batch)
        print(f"  Página {pagina+1}: {len(batch)} pedidos → Status {status}")
        
        link = r.headers.get("Link", "")
        if 'rel="next"' in link:
            import re
            match = re.search(r'page_info=([^&>]+).*?rel="next"', link)
            if match:
                page_info = match.group(1)
        else:
            break
        
        time.sleep(0.5)
    
    print(f"✅ {total} pedidos sincronizados!")
    return total

def sync_carrinhos(limit=250):
    """Sync carrinhos abandonados"""
    print(f"\n🛒 Sincronizando carrinhos abandonados...")
    r = requests.get(
        f"{SHOPIFY_URL}/checkouts.json?limit={limit}",
        headers=SHOPIFY_HEADERS
    )
    data = r.json()
    carrinhos = data.get("checkouts", [])
    
    if not carrinhos:
        print("  Nenhum carrinho encontrado")
        return 0
    
    batch = []
    for c in carrinhos:
        batch.append({
            "id": c["id"] if isinstance(c["id"], int) else hash(c.get("token","")),
            "email": c.get("email"),
            "total": float(c.get("total_price", 0)),
            "produtos_count": len(c.get("line_items", [])),
            "criado_em": c.get("created_at"),
            "atualizado_em": c.get("updated_at"),
            "url_recuperacao": c.get("abandoned_checkout_url")
        })
    
    status = upsert_supabase("shopify_carrinhos", batch)
    print(f"✅ {len(batch)} carrinhos sincronizados! Status {status}")
    return len(batch)

if __name__ == "__main__":
    print("🚀 Iniciando sync Shopify → Supabase")
    print("="*50)
    
    c = sync_clientes(limit=250, paginas=60)   # até 15.000 clientes
    p = sync_pedidos(limit=250, paginas=40)    # até 10.000 pedidos
    ca = sync_carrinhos()
    
    print("\n" + "="*50)
    print(f"✅ SYNC COMPLETO!")
    print(f"   Clientes: {c}")
    print(f"   Pedidos: {p}")
    print(f"   Carrinhos: {ca}")

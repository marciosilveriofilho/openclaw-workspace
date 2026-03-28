#!/usr/bin/env python3
"""
Cron: Verifica clientes inativos e envia para N8N
Roda 1x por dia às 10h
"""

import requests
from datetime import datetime, timedelta

SUPABASE_URL = "https://wzuawfgckwpexgyhlzsy.supabase.co"
SUPABASE_KEY = "SUPABASE_KEY_AQUI"
HEADERS = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
N8N_WEBHOOK = "https://marcioziggy.app.n8n.cloud/webhook/varejo-reativacao"

agora = datetime.utcnow()

# Janelas de reativação
janelas = [
    {"dias": 30, "min": 29, "max": 31},
    {"dias": 60, "min": 59, "max": 61},
    {"dias": 90, "min": 89, "max": 91},
]

for janela in janelas:
    data_inicio = agora - timedelta(days=janela["max"])
    data_fim = agora - timedelta(days=janela["min"])
    
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/shopify_clientes"
        f"?ultimo_pedido=gte.{data_inicio.isoformat()}Z"
        f"&ultimo_pedido=lte.{data_fim.isoformat()}Z"
        f"&ultimo_contato=is.null"
        f"&telefone=not.is.null"
        f"&limit=100",
        headers=HEADERS
    )
    
    clientes = r.json() if r.status_code == 200 else []
    if isinstance(clientes, list):
        print(f"Inativos {janela['dias']}d: {len(clientes)} clientes")
        
        for cliente in clientes:
            payload = {**cliente, "dias_inativo": janela["dias"]}
            resp = requests.post(N8N_WEBHOOK, json=payload)
            print(f"  Cliente {cliente.get('email')}: {resp.status_code}")

print("Cron reativação concluído!")

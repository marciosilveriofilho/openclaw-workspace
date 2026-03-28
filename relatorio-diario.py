#!/usr/bin/env python3
"""
Relatório Diário — Mariana Amaral Acessórios
Envia resumo todo dia às 8h no WhatsApp do Márcio
"""

import requests
from datetime import datetime, timedelta

ZAPI_URL = "https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text"
ZAPI_TOKEN = "ZAPI_CLIENT_TOKEN"
NUMERO = "5548991919060"

SUPABASE_URL = "https://wzuawfgckwpexgyhlzsy.supabase.co"
SUPABASE_KEY = "SUPABASE_KEY_AQUI"
H = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

SHOPIFY_TOKEN = "SHOPIFY_TOKEN"

ontem = (datetime.utcnow() - timedelta(hours=24)).isoformat() + "Z"

# Leads atacado (últimas 24h)
r = requests.get(f"{SUPABASE_URL}/rest/v1/leads_qualificados?criado_em=gte.{ontem}&canal=eq.atacado",
                 headers={**H, "Prefer": "count=exact"})
leads_atacado = r.headers.get("content-range","0/0").split("/")[-1]

# Leads site (últimas 24h)
r = requests.get(f"{SUPABASE_URL}/rest/v1/leads_qualificados?criado_em=gte.{ontem}&canal=eq.formulario_site",
                 headers={**H, "Prefer": "count=exact"})
leads_site = r.headers.get("content-range","0/0").split("/")[-1]

# Pedidos Shopify (últimas 24h)
r = requests.get(f"https://loja-mariana-amaral.myshopify.com/admin/api/2024-01/orders/count.json?created_at_min={ontem}&financial_status=paid",
                 headers={"X-Shopify-Access-Token": SHOPIFY_TOKEN})
pedidos = r.json().get("count", 0) if r.status_code == 200 else "?"

# Carrinhos abandonados
r = requests.get(f"{SUPABASE_URL}/rest/v1/shopify_carrinhos?select=count",
                 headers={**H, "Prefer": "count=exact"})
carrinhos = r.headers.get("content-range","0/0").split("/")[-1]

# Pedidos ML (últimas 24h)
try:
    ML_TOKEN = "APP_USR-5890019020229790-032316-59dde23b41d2b428545f2d918acf398d-2237620059"
    r = requests.get(f"https://api.mercadolibre.com/orders/search/recent?seller=2237620059",
                     headers={"Authorization": f"Bearer {ML_TOKEN}"})
    pedidos_ml = len(r.json().get("results", [])) if r.status_code == 200 else "?"
except:
    pedidos_ml = "?"

hoje = datetime.now().strftime("%d/%m/%Y")

msg = f"""📊 *Relatório Diário — {hoje}*

🤝 *Atacado (Lara SDR)*
Novos leads: {leads_atacado}
Formulário site: {leads_site}

🛍️ *Varejo (Site)*
Pedidos pagos (24h): {pedidos}
Carrinhos abandonados: {carrinhos}

🛒 *Mercado Livre*
Pedidos recentes: {pedidos_ml}

_Gerado automaticamente às 8h_
_Mariana Amaral Acessórios_ 💛"""

requests.post(ZAPI_URL,
    headers={"Content-Type": "application/json", "Client-Token": ZAPI_TOKEN},
    json={"phone": NUMERO, "message": msg})

print(f"Relatório enviado! {hoje}")

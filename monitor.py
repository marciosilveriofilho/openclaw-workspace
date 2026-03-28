#!/usr/bin/env python3
"""
Monitor de Saúde — Mariana Amaral Acessórios
Verifica todos os sistemas e alerta via WhatsApp se algo estiver errado
"""

import requests
import json
from datetime import datetime, timedelta

ZAPI_URL = "https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text"
ZAPI_TOKEN = "ZAPI_CLIENT_TOKEN"
NUMERO_ALERTA = "5548991919060"  # Márcio

SUPABASE_URL = "https://wzuawfgckwpexgyhlzsy.supabase.co"
SUPABASE_KEY = "SUPABASE_KEY_AQUI"
HEADERS_SUPA = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

SHOPIFY_TOKEN = "SHOPIFY_TOKEN"
SHOPIFY_URL = "https://loja-mariana-amaral.myshopify.com/admin/api/2024-01"

problemas = []
avisos = []

def checar(nome, ok, detalhe=""):
    if not ok:
        problemas.append(f"❌ {nome}: {detalhe}")
    return ok

def alertar(mensagem):
    requests.post(ZAPI_URL, 
        headers={"Content-Type": "application/json", "Client-Token": ZAPI_TOKEN},
        json={"phone": NUMERO_ALERTA, "message": mensagem})

# 1. Verifica Supabase
try:
    r = requests.get(f"{SUPABASE_URL}/rest/v1/leads_qualificados?select=count&limit=1", 
                     headers=HEADERS_SUPA, timeout=10)
    checar("Supabase", r.status_code == 200, f"Status {r.status_code}")
except Exception as e:
    checar("Supabase", False, str(e))

# 2. Verifica Shopify
try:
    r = requests.get(f"{SHOPIFY_URL}/shop.json",
                     headers={"X-Shopify-Access-Token": SHOPIFY_TOKEN}, timeout=10)
    checar("Shopify API", r.status_code == 200, f"Status {r.status_code}")
except Exception as e:
    checar("Shopify API", False, str(e))

# 3. Verifica Z-API
try:
    r = requests.get(
        f"https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/status",
        headers={"Client-Token": ZAPI_TOKEN}, timeout=10)
    data = r.json()
    conectado = data.get("connected", False)
    checar("Z-API WhatsApp", conectado, "WhatsApp desconectado!" if not conectado else "")
except Exception as e:
    checar("Z-API", False, str(e))

# 4. Verifica Lara — últimas execuções (via histórico Supabase)
try:
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/historico_conversa?order=data_hora.desc&limit=1",
        headers=HEADERS_SUPA, timeout=10)
    hist = r.json()
    if hist:
        ultima = hist[0].get("data_hora", "")
        if ultima:
            dt = datetime.fromisoformat(ultima.replace("Z", "+00:00"))
            horas = (datetime.now().astimezone() - dt).total_seconds() / 3600
            if horas > 24:
                avisos.append(f"⚠️ Lara: última conversa há {int(horas)}h — verificar")
except Exception as e:
    avisos.append(f"⚠️ Lara histórico: {str(e)}")

# 5. Verifica Mercado Livre token
try:
    ML_TOKEN = "APP_USR-5890019020229790-032316-59dde23b41d2b428545f2d918acf398d-2237620059"
    r = requests.get("https://api.mercadolibre.com/users/me",
                     headers={"Authorization": f"Bearer {ML_TOKEN}"}, timeout=10)
    checar("Mercado Livre API", r.status_code == 200, f"Token expirado? Status {r.status_code}")
except Exception as e:
    checar("Mercado Livre", False, str(e))

# 6. Verifica leads novos nas últimas 24h
try:
    ontem = (datetime.utcnow() - timedelta(hours=24)).isoformat() + "Z"
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/leads_qualificados?criado_em=gte.{ontem}",
        headers={**HEADERS_SUPA, "Prefer": "count=exact"}, timeout=10)
    count = r.headers.get("content-range", "0-0/0").split("/")[-1]
    print(f"Leads últimas 24h: {count}")
except Exception as e:
    print(f"Erro ao contar leads: {e}")

# Monta e envia alerta se houver problemas
agora = datetime.now().strftime("%d/%m %H:%M")

if problemas:
    msg = f"🚨 *ALERTA — {agora}*\n\n"
    msg += "\n".join(problemas)
    if avisos:
        msg += "\n\n" + "\n".join(avisos)
    msg += "\n\n_Monitor Automático Mariana Amaral_"
    alertar(msg)
    print("ALERTA ENVIADO!")
elif avisos:
    msg = f"⚠️ *Avisos — {agora}*\n\n"
    msg += "\n".join(avisos)
    msg += "\n\n_Monitor Automático_"
    alertar(msg)
    print("AVISO ENVIADO!")
else:
    print(f"✅ Tudo ok — {agora}")

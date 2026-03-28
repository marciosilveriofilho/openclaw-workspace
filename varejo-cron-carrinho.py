#!/usr/bin/env python3
"""
Cron: Verifica carrinhos abandonados e envia para N8N processar
Roda a cada hora
"""

import requests
from datetime import datetime, timedelta
import json

SUPABASE_URL = "https://wzuawfgckwpexgyhlzsy.supabase.co"
SUPABASE_KEY = "SUPABASE_KEY_AQUI"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

# Webhook N8N para processar carrinho
N8N_WEBHOOK = "https://marcioziggy.app.n8n.cloud/webhook/varejo-carrinho"

agora = datetime.utcnow()

# Janelas de tempo para disparo
janelas = [
    {"horas": 1,  "min": 0.8, "max": 1.5},   # ~1 hora
    {"horas": 24, "min": 23,  "max": 25},     # ~24 horas
    {"horas": 72, "min": 71,  "max": 73},     # ~72 horas
]

for janela in janelas:
    hora_inicio = agora - timedelta(hours=janela["max"])
    hora_fim = agora - timedelta(hours=janela["min"])
    
    # Busca carrinhos abandonados nessa janela de tempo
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/shopify_carrinhos"
        f"?atualizado_em=gte.{hora_inicio.isoformat()}Z"
        f"&atualizado_em=lte.{hora_fim.isoformat()}Z"
        f"&ultimo_contato=is.null"
        f"&email=not.is.null"
        f"&limit=50",
        headers=HEADERS
    )
    
    carrinhos = r.json() if r.status_code == 200 else []
    if isinstance(carrinhos, list):
        print(f"Janela {janela['horas']}h: {len(carrinhos)} carrinhos")
        
        for carrinho in carrinhos:
            # Envia pro N8N processar
            payload = {
                **carrinho,
                "horas_abandonado": janela["horas"]
            }
            resp = requests.post(N8N_WEBHOOK, json=payload)
            print(f"  Carrinho {carrinho.get('id')}: {resp.status_code}")

print("Cron carrinho concluído!")

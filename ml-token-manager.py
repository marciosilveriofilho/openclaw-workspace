#!/usr/bin/env python3
"""
ML Token Manager — Renova automaticamente o token do Mercado Livre
Roda a cada 5 horas via cron
"""

import requests
import json
import os
from datetime import datetime

TOKEN_FILE = "/root/.openclaw/workspace/ml-tokens.json"
CLIENT_ID = "5890019020229790"
CLIENT_SECRET = "XQEQLXjLLsVywpq9bmUqtfDWrhkDwXwp"

def salvar_tokens(access_token, refresh_token):
    with open(TOKEN_FILE, "w") as f:
        json.dump({
            "access_token": access_token,
            "refresh_token": refresh_token,
            "atualizado_em": datetime.utcnow().isoformat()
        }, f)

def carregar_tokens():
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            return json.load(f)
    return {}

def renovar_token():
    tokens = carregar_tokens()
    refresh_token = tokens.get("refresh_token")
    
    if not refresh_token:
        print("❌ Sem refresh_token salvo!")
        return None
    
    r = requests.post("https://api.mercadolibre.com/oauth/token",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "grant_type": "refresh_token",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "refresh_token": refresh_token
        })
    
    if r.status_code == 200:
        data = r.json()
        salvar_tokens(data["access_token"], data["refresh_token"])
        print(f"✅ Token ML renovado! {datetime.now().strftime('%d/%m %H:%M')}")
        return data["access_token"]
    else:
        print(f"❌ Erro ao renovar: {r.status_code} — {r.text}")
        return None

def get_token():
    """Retorna o access_token atual"""
    tokens = carregar_tokens()
    return tokens.get("access_token")

if __name__ == "__main__":
    renovar_token()

# OpenClaw Workspace — Mariana Amaral Acessórios

## 🤖 Sobre
Workspace do assistente Dudu (OpenClaw) configurado para o projeto Mariana Amaral Acessórios.

## 🚀 Deploy em novo servidor

### 1. Instalar OpenClaw
```bash
npm install -g openclaw
```

### 2. Clonar este repositório
```bash
cd ~/.openclaw
git clone https://github.com/marciosilveriofilho/openclaw-workspace.git workspace
```

### 3. Configurar variáveis de ambiente
Criar o arquivo `~/.openclaw/.env` com:
```
ELEVENLABS_API_KEY=...
TAVILY_API_KEY=...
GROQ_API_KEY=...
ML_CLIENT_ID=...
ML_CLIENT_SECRET=...
ML_ACCESS_TOKEN=...
ML_REFRESH_TOKEN=...
ML_USER_ID=...
SHOPIFY_ACCESS_TOKEN=...
SHOPIFY_STORE=loja-mariana-amaral.myshopify.com
```

### 4. Configurar OpenClaw
```bash
openclaw configure
```

### 5. Iniciar gateway
```bash
openclaw gateway start
```

## 📁 Estrutura

```
workspace/
├── AGENTS.md          # Instruções do agente
├── SOUL.md            # Personalidade do Dudu
├── IDENTITY.md        # Identidade: Dudu
├── USER.md            # Perfil do Márcio
├── PLANO_MARCIO.md    # Plano de projetos
├── integrations.md    # URLs e tokens das integrações
├── memory/            # Memória diária
├── LARA-NO1-DEFINITIVO.js   # Primeiro nó da Lara SDR
├── LARA-NO2-DEFINITIVO.js   # Segundo nó da Lara SDR
├── handoff-crm.js     # Workflow handoff CRM
└── lara-sdr/          # Arquivos da Lara (Claude Code)
```

## 🔗 Integrações ativas
- **Lara SDR** — N8N + Z-API + Claude + Supabase
- **CRM** — marianacrms.com (Lovable + Supabase)
- **Mercado Livre** — API conectada
- **Google Agenda** — Apps Script webhook
- **Shopify** — Flow → N8N → Supabase

## 👥 Equipe
- Márcio Filho (admin)
- Mariana Amaral (admin)
- Ada, Aline, Vanessa (representantes atacado)
- Tamilly (SDR humana)
- Taysmara (varejo)
- Site/SAC (loja.online@)

## ⚠️ Segurança
- NUNCA commitar o arquivo `.env`
- Trocar todos os tokens após migração
- Criar novas API keys na Anthropic e Z-API

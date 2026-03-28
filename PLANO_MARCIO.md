# Plano Dudu x Márcio 🚀

## Quem é o Márcio
- Negócios + Marketing
- Marca pessoal própria
- Empresa: **Mariana Amaral Acessórios**
- Estudando IA e Inglês (intermediário)
- Precisa melhorar organização

---

## 🎯 O que o Dudu vai fazer por ele

### 1. 📱 Análise de Conteúdo (Instagram + TikTok)
- Monitorar tendências e formatos que estão tracionando
- Analisar perfis concorrentes e referências
- Sugerir pautas, formatos, legendas, CTAs
- Calendário editorial para marca pessoal e Mariana Amaral

### 2. 🎬 Transcrição e Análise de Mídia
- Vídeos do YouTube → resumo, ideias, insights
- Áudios e vídeos enviados pelo Telegram → transcrição
- Stories e vídeos curtos → análise de conteúdo
- **Precisa ativar:** Groq (Whisper) — console.groq.com (grátis)

### 3. 📣 Meta Ads
- Análise de anúncios concorrentes (via biblioteca de anúncios)
- Sugestões de copy, criativo, público
- Acompanhamento de resultados
- **Integração desejada:** Meta Ads API ou planilha de resultados

### 4. 📊 Planilhas de Acompanhamento
- Conectar com Google Sheets de resultados
- Análise automática de métricas
- Alertas quando algo estiver fora do padrão
- **Precisa:** acesso à planilha (link + permissão)

### 5. ✍️ Produção de Conteúdo
- Rascunhos de posts, captions, roteiros
- Ajuste de tom e linguagem
- Adaptação para diferentes plataformas (IG, TikTok, LinkedIn)
- Reescrever textos com mais impacto

### 6. 📬 Alertas e Agenda
- E-mails importantes (Gmail: marciosilveriofilho@gmail.com)
- Previsão do tempo — Grande Florianópolis
- Compromissos e prazos
- **Integração desejada:** Notion (recomendado)

---

## 🔧 Setup Técnico — O que precisa ser feito

| Item | Status | O que precisa |
|------|--------|---------------|
| Telegram | ✅ Ativo | — |
| DuckDuckGo | ✅ Ativo | — |
| Memória | ✅ Ativa | — |
| Clima Floripa | 🟡 Pronto | Só configurar horário |
| Gmail | 🔴 Pendente | OAuth no painel |
| Groq (transcrição) | 🔴 Pendente | API key grátis em console.groq.com |
| ElevenLabs (voz) | 🔴 Pendente | API key grátis em elevenlabs.io |
| Notion | 🔴 Pendente | Criar workspace + integration key |
| Google Sheets | 🔴 Pendente | Link da planilha + permissão |
| Google Agenda | ✅ Ativo | webhook via Apps Script configurado |
| Meta Ads | 🔴 Pendente | Definir abordagem (API ou manual) |

---

## 📋 Ordem sugerida de setup

1. **Groq** — transcrição, impacto imediato, grátis
2. **Notion** — organização, base de tudo
3. **Gmail** — alertas de e-mail
4. **Google Sheets** — acompanhamento de resultados
5. **ElevenLabs** — voz (bônus)
6. **Meta Ads** — definir estratégia

---

## 🏢 Estrutura Comercial — Mariana Amaral Acessórios

### Canal Atacado (B2B)
**Fluxo:** Lara SDR → SDR Humano (análise de praça) → Representante da Região → Venda

| Pessoa | Região |
|--------|--------|
| Aline | Sudeste SC, Norte SC, Oeste SC |
| Ada | Rio Grande do Sul, Nordeste, Centro-Oeste |
| Vanessa | Grande Florianópolis, Sul SC, Norte SC |

**Pós-venda:** Estratégia para leads que não fecharam (a desenvolver)

### Canal Varejo (B2C)
- **Taysmara** — WhatsApp varejo (demanda reprimida da região + clientes que buscam produto específico)
- **Site/SAC** — WhatsApp do site (SAC + venda de produtos complementares para clientes do site)

### Marketplaces
- **Mercado Livre** — já conectado ao Dudu ✅
- **TikTok Shop** — a integrar

### Agentes de IA planejados
1. **Lara** — SDR Atacado ✅ funcionando
2. **Agente Varejo** — WhatsApp varejo (em desenvolvimento)
3. **Agente ML/TikTok** — administração de marketplaces
4. **Agente Análise de Praça** — automatizar análise de exclusividade (futuro)

## 🗂️ Projetos ativos
- Marca pessoal Márcio Filho
- Mariana Amaral Acessórios

## ⚠️ Otimização de custos Claude
- Gastamos todo o crédito mensal em 2 dias de trabalho intenso
- Pensar em estratégias de economia: cache, prompts menores, modelo mais barato pra tarefas simples
- Separar uso pessoal (Dudu) do uso dos agentes (Lara, varejo)

## 📋 TO DO — Próximas sessões (PRIORIDADE)

### 1. Importar lista de clientes existentes → CRM
- Subir planilha de clientes (Excel/CSV) direto no Supabase
- Mapear campos: nome, telefone, cidade, status

### 2. Fluxos de reengajamento automático (N8N + Z-API)
- **Standby sem resposta:** Lead parou de responder → mensagem automática após X horas
- **Viu política + catálogo mas sumiu:** Follow-up automático 24h, 48h, 7 dias
- **Cadastrou mas não comprou:** Campanha de reativação mensal
- **Não compra há muito tempo:** Alerta automático pra consultora

### 3. Agente de varejo (Taysmara/Site)
### 4. Meta Ads integração
### 5. Número da Vanessa
### 6. Backup automático GitHub do workspace + README de deploy ✅ FEITO
### 7. Prompt de segurança — blindar ferramentas e acessos
### 8. Mercado Livre — agente varejo (mesmas estratégias: pós-compra, reativação, cross-sell)
### 9. TikTok Shop — integrar API + agente varejo
### 10. Criar cupons no Shopify: VOLTA10, VOLTA15, VOLTEI10, VOLTEI15, OBRIGADA10
### 11. Links de produtos específicos nas mensagens do agente varejo

## 📋 TO DO — Organização N8N
- [ ] Criar pasta "Mariana Amaral Acessórios" no N8N
- [ ] Mover: Lara SDR, Shopify Revenda CRM, Handoff CRM, Agente Varejo

## 📋 Próximos projetos (fila)
1. Finalizar Lara SDR (segundo nó robusto + Z-API token)
2. CRM no Lovable
3. Catálogo estratégico na Lara (2 catálogos antigos após cadastro)
4. Voz nos agentes via ElevenLabs (com consentimento Mariana)
5. Agente de inglês (conversação + correção via Telegram)
6. Agente varejo Shopify
7. Meta Ads integração
8. Notion organização
9. Follow-up automático leads inativos
10. Análise de praça automática (Supabase)

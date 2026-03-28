# Roadmap 90 Dias — Mariana Amaral Acessórios
## Baseado no Guia Estratégico 2026

---

## DIAS 1-30 · Fundação — Caixa, Estoque e Diagnóstico

### ✅ Já feito
- Lara SDR qualificando lojistas atacado
- Fluxo de recuperação de carrinho (varejo)
- CRM com pipeline de leads (marianacrms.com)
- Base de clientes no Supabase (12.679 clientes)

### 🔴 Pendente — Dias 1-30
- [ ] **Margem real por canal** — calcular via Shopify + ML + atacado
- [ ] **Curva ABC de produtos** — ranking por giro e margem (já temos dados!)
- [ ] **Painel de caixa projetado** — integrar com Tiny/ERP
- [ ] **Lista de lojistas por potencial de recompra** — quem parou de comprar no atacado

---

## DIAS 31-60 · Ativação — Agentes, CRM e Site

### ✅ Já feito
- Agente comercial atacado (Lara SDR) ✅
- Campanhas automáticas recompra varejo ✅
- CRM com pipeline ✅

### 🔴 Pendente — Dias 31-60
- [ ] **Motor de recompra atacado** — alertas para lojistas que pararam de comprar
- [ ] **Recomendação de kits no site** — cross-sell inteligente (em andamento)
- [ ] **Separar sortimento** — escalar / importar / testar / liquidar
- [ ] **Testar pré-venda** — cápsula específica com reserva
- [ ] **Dashboard semanal** — giro, margem, cobertura por SKU

---

## DIAS 61-90 · Escala — Integração e Decisão

### 🔴 Pendente — Dias 61-90
- [ ] **Integrar Dev Master** — atacado com CRM e Supabase
- [ ] **Calendário de coleção por dados** — baseado em giro histórico
- [ ] **Rever política comercial atacado** — margem comprimida
- [ ] **Escalar site e WhatsApp varejo** — menos dependência do atacado
- [ ] **Decidir marketplaces** — onde vale ML, TikTok, outros

---

## CICLO DE INTELIGÊNCIA — Como implementar

```
Dados de Venda (Shopify + ML + TikTok + Atacado)
    ↓
Análise de Giro e Margem com IA (Supabase + Claude)
    ↓
Classificação automática:
  → ESCALAR — alto giro + margem
  → TESTAR — potencial não confirmado  
  → LIQUIDAR — parado, drena caixa
  → REPOR — giro alto, risco ruptura
    ↓
Planejamento de Coleção e Compra (China x Fábrica)
    ↓
Ativação Comercial e Digital (Lara + Agente Varejo + CRM)
    ↓
Recompra + Previsibilidade
    ↓
Melhora de Caixa e Margem ← OBJETIVO CENTRAL
```

---

## RISCOS A EVITAR

⚠️ **Automatizar sem corrigir margem** — não escalar volume sem resolver sortimento
⚠️ **Atacado como intocável** — rever mix de canais com dados reais
⚠️ **IA sem dono e processo** — Márcio é o dono, processo está sendo construído

---

## PRÓXIMAS IMPLEMENTAÇÕES (ordem de prioridade)

1. **Curva ABC de produtos** — calcular giro e margem por SKU (dados já no Supabase)
2. **Motor de recompra atacado** — alertar lojistas inativos (igual varejo)
3. **Dashboard semanal** — giro, margem, cobertura
4. **Integração Dev Master** — atacado em tempo real
5. **Pré-venda** — cápsula com reserva de coleção
6. **Previsão de demanda** — reduzir descasamento de caixa

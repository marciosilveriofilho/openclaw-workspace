# Análise do código da Lara SDR

## Bugs encontrados

### 1. Erro de sintaxe na linha 5 (CRÍTICO)
```javascript
const mensagem = (body?.text?.message body?.text body?.caption || '')
```
Faltam os operadores `||` entre as expressões. Correto:
```javascript
const mensagem = (body?.text?.message || body?.text || body?.caption || '')
```

### 2. Template literals sem backticks (CRÍTICO)
Várias URLs usando template literals sem backticks:
```javascript
url: ${SUPABASE_URL}/rest/v1/historico_conversa?telefone=eq.${telefone}...
```
Correto:
```javascript
url: `${SUPABASE_URL}/rest/v1/historico_conversa?telefone=eq.${telefone}...`
```

### 3. Bearer sem template literal
```javascript
'Authorization': Bearer ${SUPABASE_KEY}
```
Correto:
```javascript
'Authorization': `Bearer ${SUPABASE_KEY}`
```

### 4. API key do Claude com quebra de linha
```javascript
'x-api-key': 'ANTHROPIC_API_KEY_AQUI
',
```
Tem uma quebra de linha no meio da key — remover.

### 5. Model name errado
```javascript
model: 'claude-sonnet-4-20250514',
```
Correto:
```javascript
model: 'claude-sonnet-4-5',
```

### 6. system com S maiúsculo
```javascript
System (untrusted): prompt,
```
Correto:
```javascript
system: prompt,
```

// Workflow: Pós-compra Imediato (5 min) — Cross-sell + Frete
// Mariana Amaral Varejo — Claude Haiku

const SHOPIFY_TOKEN = 'SHOPIFY_TOKEN_AQUI';
const SUPABASE_URL = 'https://wzuawfgckwpexgyhlzsy.supabase.co';
const SUPABASE_KEY = 'SUPABASE_KEY_AQUI';
const ZAPI_URL = 'https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text';
const ZAPI_TOKEN = 'ZAPI_TOKEN_AQUI';
const ANTHROPIC_KEY = 'ANTHROPIC_KEY_AQUI';
const FRETE_GRATIS_MINIMO = 150;

const input = $input.first().json;
// N8N pode colocar os dados em body ou direto
const pedido = input.body || input;
const nome = (pedido.nome || '').split(' ')[0];
const telefone = pedido.telefone || pedido.phone || '';
const email = pedido.email || '';
const produtos_comprados = pedido.produtos || pedido.line_items || [];
const total = parseFloat(pedido.total || pedido.total_price || 0);
const order_id = pedido.id || '';

if (!telefone) {
  return [{ json: { status: 'sem_telefone' } }];
}

// Busca produtos que combinam no Shopify
let produtos_sugeridos = [];
try {
  const produto_principal = produtos_comprados[0] || {};
  const titulo = produto_principal.title || '';
  
  // Detecta cor/material
  const getCor = (t) => {
    t = t.toLowerCase();
    if (t.includes('dourado') || t.includes('ouro') || t.includes('gold')) return 'dourado';
    if (t.includes('prateado') || t.includes('prata') || t.includes('silver')) return 'prateado';
    if (t.includes('rosé') || t.includes('rose')) return 'rosé';
    return null;
  };
  
  const cor = getCor(titulo);
  const busca = cor || titulo.split(' ').slice(0, 3).join(' ');
  
  const shopResp = await this.helpers.httpRequest({
    method: 'GET',
    url: `https://loja-mariana-amaral.myshopify.com/admin/api/2024-01/products.json?title=${encodeURIComponent(busca)}&limit=10`,
    headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
  });
  
  // Filtra produtos que a pessoa NÃO comprou
  const ids_comprados = produtos_comprados.map(p => p.product_id);
  produtos_sugeridos = (shopResp.products || [])
    .filter(p => !ids_comprados.includes(p.id))
    .slice(0, 3)
    .map(p => ({
      titulo: p.title,
      preco: p.variants?.[0]?.price,
      url: `https://marianaamaral.com.br/products/${p.handle}`
    }));
} catch(e) {
  console.log('Erro Shopify:', e.message);
}

// Calcula frete
const faltando_frete = FRETE_GRATIS_MINIMO - total;
const tem_frete_gratis = total >= FRETE_GRATIS_MINIMO;

// Monta contexto para o Claude
const prompt = `Você é a própria Mariana Amaral — fundadora da marca, mulher sofisticada de 35 anos, catarinense, apaixonada por acessórios. Você acabou de ver que uma cliente finalizou um pedido e quer aproveitar o momento pra sugerir mais peças.

PEDIDO CONFIRMADO:
${produtos_comprados.map(p => `- ${p.title} (R$ ${p.price})`).join('\n')}
Total: R$ ${total.toFixed(2)}

${tem_frete_gratis ? '✅ Já tem frete grátis!' : `⚠️ Faltam R$ ${faltando_frete.toFixed(2)} para frete grátis (mínimo R$ ${FRETE_GRATIS_MINIMO})`}

PEÇAS DISPONÍVEIS QUE COMBINAM:
${produtos_sugeridos.map(p => `- ${p.titulo} (R$ ${p.preco}) — ${p.url}`).join('\n')}

ESCREVA UMA MENSAGEM de WhatsApp que:
1. Confirma o pedido com carinho (1 linha)
2. ${tem_frete_gratis 
  ? 'Sugere aproveitar o frete já pago para adicionar mais peças'
  : `Sugere adicionar mais peças para ganhar frete grátis (faltam só R$ ${faltando_frete.toFixed(2)})`}
3. Menciona 1-2 peças específicas que combinam (pelo nome real)
4. Inclui o link da loja

REGRAS DE FORMATAÇÃO OBRIGATÓRIAS:
- Use *negrito* (asterisco simples) nos elementos importantes: nome do produto, valor do desconto, código do cupom
- Exemplo correto de negrito: *Brinco Dourado Riviera*, *frete grátis*, *R$ 60,00*
- Emojis: máximo 1, apenas os mais delicados (✨ ou 💛) — nunca exagerados
- Tom: sofisticada, feminina, direta — como se fosse a própria Mariana
- Máximo 4 linhas
- Nunca robótica — 100% humana
- Não use "Oi amiga" ou qualquer termo muito informal

Responda APENAS com a mensagem, sem explicações.`;

const claudeResp = await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.anthropic.com/v1/messages',
  headers: {
    'x-api-key': ANTHROPIC_KEY,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json'
  },
  body: {
    model: 'claude-haiku-4-5',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }]
  },
  json: true
});

const mensagem = claudeResp?.content?.[0]?.text || claudeResp?.content?.[0]?.texto || '';

if (!mensagem) {
  return [{ json: { status: 'erro_claude' } }];
}

// Envia WhatsApp
await this.helpers.httpRequest({
  method: 'POST',
  url: ZAPI_URL,
  headers: { 'Content-Type': 'application/json', 'Client-Token': ZAPI_TOKEN },
  body: { phone: telefone, message: mensagem },
  json: true
});

// Marca pedido como pós-compra enviado
await this.helpers.httpRequest({
  method: 'PATCH',
  url: `${SUPABASE_URL}/rest/v1/shopify_pedidos?id=eq.${order_id}`,
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: { pos_compra_enviado: true },
  json: true
});

return [{ json: { status: 'enviado', telefone, mensagem, tem_frete_gratis } }];

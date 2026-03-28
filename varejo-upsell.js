// Workflow: Up-sell Inteligente — Mariana Amaral Varejo
// 1. Frete grátis (faltando pouco)
// 2. Kit completo (mesma coleção)
// 3. Quantidade (3 peças com desconto)
// Usa Claude para gerar mensagem personalizada

const SHOPIFY_TOKEN = 'SHOPIFY_TOKEN_AQUI';
const ZAPI_URL = 'https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text';
const ZAPI_TOKEN = 'ZAPI_TOKEN_AQUI';
const ANTHROPIC_KEY = 'ANTHROPIC_KEY_AQUI';

const FRETE_GRATIS_MINIMO = 150; // R$ mínimo para frete grátis

const carrinho = $input.first().json;
const nome = (carrinho.nome || '').split(' ')[0];
const telefone = carrinho.telefone || '';
const total = parseFloat(carrinho.total || 0);
const produtos = carrinho.produtos || [];

if (!telefone) {
  return [{ json: { status: 'sem_telefone' } }];
}

// Define qual upsell aplicar
let tipo_upsell = '';
let contexto_extra = '';

const faltando_frete = FRETE_GRATIS_MINIMO - total;

if (faltando_frete > 0 && faltando_frete <= 50) {
  // Faltam menos de R$50 para frete grátis
  tipo_upsell = 'frete_gratis';
  contexto_extra = `Valor atual do carrinho: R$ ${total.toFixed(2)}. Faltam R$ ${faltando_frete.toFixed(2)} para frete grátis (mínimo R$ ${FRETE_GRATIS_MINIMO}).`;
} else if (produtos.length === 1) {
  // Comprou só 1 peça — sugere kit
  tipo_upsell = 'kit';
  contexto_extra = `A cliente tem apenas 1 produto no carrinho: ${produtos[0]?.title}`;
} else {
  // Default: quantidade
  tipo_upsell = 'quantidade';
  contexto_extra = `A cliente tem ${produtos.length} produtos. Total: R$ ${total.toFixed(2)}.`;
}

// Busca produtos complementares no Shopify
let produtos_sugeridos = [];
try {
  const produto_principal = produtos[0] || {};
  const titulo = produto_principal.title || '';
  
  // Extrai termos de busca do produto
  const termos = titulo.split(' ').slice(0, 3).join(' ');
  
  const shopResp = await this.helpers.httpRequest({
    method: 'GET',
    url: `https://loja-mariana-amaral.myshopify.com/admin/api/2024-01/products.json?title=${encodeURIComponent(termos)}&limit=5`,
    headers: { 'X-Shopify-Access-Token': SHOPIFY_TOKEN }
  });
  
  produtos_sugeridos = (shopResp.products || [])
    .filter(p => !produtos.find(cp => cp.product_id === p.id))
    .slice(0, 3)
    .map(p => ({ titulo: p.title, preco: p.variants?.[0]?.price }));
} catch(e) {}

// Claude gera mensagem personalizada
const prompts = {
  frete_gratis: `Você é a voz da Mariana Amaral, marca de semijoias sofisticada.

CONTEXTO: ${contexto_extra}

PRODUTOS DISPONÍVEIS QUE COMBINAM:
${produtos_sugeridos.map(p => `- ${p.titulo} (R$ ${p.preco})`).join('\n')}

Escreva UMA mensagem curta e elegante sugerindo que a cliente adicione mais uma peça para ganhar frete grátis. 
Mencione o valor que falta (R$ ${faltando_frete.toFixed(2)}).
Tom: sofisticado, feminino, direto. Máximo 3 linhas. No máximo 1 emoji.`,

  kit: `Você é a voz da Mariana Amaral, marca de semijoias sofisticada.

PRODUTO NO CARRINHO: ${produtos[0]?.title}

PRODUTOS QUE FORMAM UM KIT:
${produtos_sugeridos.map(p => `- ${p.titulo} (R$ ${p.preco})`).join('\n')}

Escreva UMA mensagem curta e elegante sugerindo que a cliente monte um kit completo com peças que combinam.
Tom: consultora de moda sofisticada. Máximo 3 linhas. No máximo 1 emoji.`,

  quantidade: `Você é a voz da Mariana Amaral, marca de semijoias sofisticada.

CARRINHO ATUAL: ${produtos.map(p => p.title).join(', ')} — Total: R$ ${total.toFixed(2)}

Escreva UMA mensagem curta sugerindo que a cliente leve mais peças para aproveitar o pedido.
Tom: sofisticado, sem forçar. Máximo 3 linhas. No máximo 1 emoji.`
};

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
    max_tokens: 200,
    messages: [{ role: 'user', content: prompts[tipo_upsell] }]
  },
  json: true
});

const mensagem = claudeResp?.content?.[0]?.text || claudeResp?.content?.[0]?.texto || '';

if (!mensagem) {
  return [{ json: { status: 'erro_claude' } }];
}

// Envia via Z-API
await this.helpers.httpRequest({
  method: 'POST',
  url: ZAPI_URL,
  headers: { 'Content-Type': 'application/json', 'Client-Token': ZAPI_TOKEN },
  body: { phone: telefone, message: mensagem },
  json: true
});

return [{ json: { status: 'enviado', tipo_upsell, telefone, mensagem } }];

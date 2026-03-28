// Workflow: Carrinho Abandonado — Mariana Amaral Varejo
// Roda via cron — verifica carrinhos abandonados no Supabase e envia mensagens

const SUPABASE_URL = 'https://wzuawfgckwpexgyhlzsy.supabase.co';
const SUPABASE_KEY = 'SUPABASE_KEY_AQUI';
const ZAPI_URL = 'https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text';
const ZAPI_TOKEN = 'ZAPI_TOKEN_AQUI';

// Pega o carrinho do input
const raw = $input.first().json;
const carrinho = raw.body || raw;
const email = carrinho.email || '';
const total = carrinho.total || 0;
const url_recuperacao = carrinho.url_recuperacao || 'https://marianaamaral.com.br';
const telefone = carrinho.telefone || '';
const nome = carrinho.nome || '';
const horas_abandonado = carrinho.horas_abandonado || 1;

if (!telefone || !email) {
  return [{ json: { status: 'sem_telefone', email } }];
}

// Define mensagem baseada no tempo de abandono
let mensagem = '';

if (horas_abandonado < 2) {
  // 1h — lembrete sem desconto
  mensagem = `Oi${nome ? ', ' + nome.split(' ')[0] : ''}! 💛

Vi que você deixou algumas peças lindas esperando por você na Mariana Amaral.

Quando quiser retomar, elas ainda estão reservadas para você:
👉 ${url_recuperacao}

Qualquer dúvida, é só chamar! ✨`;

} else if (horas_abandonado >= 24 && horas_abandonado < 25) {
  // 24h — 10% de desconto
  mensagem = `${nome ? nome.split(' ')[0] + ', que' : 'Que'} bom que você ainda está por aqui! 🌟

Separamos um presente especial para você finalizar sua compra:

🎁 *10% de desconto* com o código *VOLTA10*

Suas peças continuam esperando:
👉 ${url_recuperacao}

Válido por 48h. Aproveite! 💛`;

} else if (horas_abandonado >= 72 && horas_abandonado < 73) {
  // 72h — 15% última chance
  mensagem = `${nome ? nome.split(' ')[0] + ', é' : 'É'} sua última chance! ✨

Essas peças são muito disputadas e não queremos que você perca.

🎁 *15% de desconto* com o código *VOLTA15*

👉 ${url_recuperacao}

Oferta válida só por hoje. Não deixe passar! 💛`;
}

if (!mensagem) {
  return [{ json: { status: 'fora_do_horario', horas: horas_abandonado } }];
}

// Envia via Z-API
const resp = await this.helpers.httpRequest({
  method: 'POST',
  url: ZAPI_URL,
  headers: {
    'Content-Type': 'application/json',
    'Client-Token': ZAPI_TOKEN
  },
  body: { phone: telefone, message: mensagem },
  json: true
});

// Registra no Supabase que foi enviado
await this.helpers.httpRequest({
  method: 'PATCH',
  url: `${SUPABASE_URL}/rest/v1/shopify_carrinhos?id=eq.${carrinho.id}`,
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: { ultimo_contato: new Date().toISOString() },
  json: true
});

return [{ json: { status: 'enviado', telefone, horas: horas_abandonado } }];

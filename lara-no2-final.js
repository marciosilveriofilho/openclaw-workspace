const item = $input.first().json;
const resposta = item.resposta || {};
const telefone = item.telefone;
const conteudo = resposta.content || resposta.conteudo || [];
const texto = conteudo[0] ? (conteudo[0].text || conteudo[0].texto || '') : '';

let textoLimpo = texto;
textoLimpo = textoLimpo.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
const inicio = textoLimpo.indexOf('{');
const fim = textoLimpo.lastIndexOf('}');
if (inicio !== -1 && fim !== -1) {
  textoLimpo = textoLimpo.substring(inicio, fim + 1);
}

let messages = [];
let lead_qualificado = false;
let resumo_lead = '';

try {
  const dados = JSON.parse(textoLimpo);
  messages = dados.messages || [];
  lead_qualificado = dados.lead_qualificado || false;
  resumo_lead = dados.resumo_lead || '';
} catch(e) {
  messages = ['Desculpe, tive um problema. Pode repetir?'];
}

const SUPABASE_URL = 'https://wzuawfgckwpexgyhlzsy.supabase.co';
const SUPABASE_KEY = 'SUPABASE_KEY_AQUI';

await this.helpers.httpRequest({
  method: 'POST',
  url: `${SUPABASE_URL}/rest/v1/historico_conversa`,
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: { telefone, role: 'assistant', conteudo: messages[0] },
  json: true
});

if (lead_qualificado) {
  await this.helpers.httpRequest({
    method: 'POST',
    url: `${SUPABASE_URL}/rest/v1/leads_qualificados`,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: { telefone, resumo_lead, status: 'novo' },
    json: true
  });
}

const ZAPI_URL = 'https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text';
const ZAPI_TOKEN = 'F649b2fcc73234130a0e46a8352302df0S';

for (const msg of messages) {
  await this.helpers.httpRequest({
    method: 'POST',
    url: ZAPI_URL,
    headers: {
      'Content-Type': 'application/json',
      'Client-Token': ZAPI_TOKEN
    },
    body: { phone: telefone, message: msg },
    json: true
  });
  await new Promise(resolve => setTimeout(resolve, 1200));
}

return [{ json: { mensagem: messages[0], lead_qualificado, resumo_lead, telefone } }];

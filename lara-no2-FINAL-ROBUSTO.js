const item = $input.first().json;
const resposta = item.resposta || {};
const telefone = item.telefone;
const conteudo = resposta.content || resposta.conteudo || [];
const texto = conteudo[0] ? (conteudo[0].text || conteudo[0].texto || '') : '';

// ===== PARSE ULTRA ROBUSTO =====
let textoLimpo = texto;

// Remove blocos de código markdown
textoLimpo = textoLimpo.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

// Extrai só o JSON entre { }
const inicio = textoLimpo.indexOf('{');
const fim = textoLimpo.lastIndexOf('}');
if (inicio !== -1 && fim !== -1) {
  textoLimpo = textoLimpo.substring(inicio, fim + 1);
}

// Normaliza aspas e caracteres problemáticos
textoLimpo = textoLimpo
  .replace(/[\u201C\u201D]/g, '"')  // aspas curvas -> aspas retas
  .replace(/[\u2018\u2019]/g, "'")  // apostrofes curvas -> retas
  .replace(/\r\n/g, '\\n')          // quebras de linha Windows
  .replace(/\r/g, '\\n')            // quebras de linha Mac
  .replace(/\n/g, '\\n');           // quebras de linha Unix

let messages = [];
let lead_qualificado = false;
let resumo_lead = '';

try {
  const dados = JSON.parse(textoLimpo);
  messages = Array.isArray(dados.messages) ? dados.messages : [];
  lead_qualificado = dados.lead_qualificado === true;
  resumo_lead = dados.resumo_lead || '';
} catch(e) {
  // Tenta extrair mensagens mesmo com JSON quebrado
  const matchMessages = textoLimpo.match(/"messages"\s*:\s*\[(.*?)\]/s);
  if (matchMessages) {
    try {
      messages = JSON.parse('[' + matchMessages[1] + ']');
    } catch(e2) {
      // Extrai strings individuais do array
      const msgMatches = matchMessages[1].match(/"([^"]+)"/g);
      if (msgMatches) {
        messages = msgMatches.map(m => m.replace(/^"|"$/g, ''));
      }
    }
  }
  // Verifica lead_qualificado mesmo com JSON quebrado
  if (textoLimpo.includes('"lead_qualificado": true') || textoLimpo.includes('"lead_qualificado":true')) {
    lead_qualificado = true;
  }
  // Extrai resumo_lead mesmo com JSON quebrado
  const matchResumo = textoLimpo.match(/"resumo_lead"\s*:\s*"([\s\S]*?)(?:"\s*}|",\s*")/);
  if (matchResumo) {
    resumo_lead = matchResumo[1];
  }
  // Fallback final
  if (messages.length === 0) {
    messages = ['Desculpe, tive um problema. Pode repetir?'];
  }
}

// ===== SUPABASE =====
const SUPABASE_URL = 'https://wzuawfgckwpexgyhlzsy.supabase.co';
const SUPABASE_KEY = 'SUPABASE_KEY_AQUI';

// Salva histórico
await this.helpers.httpRequest({
  method: 'POST',
  url: `${SUPABASE_URL}/rest/v1/historico_conversa`,
  headers: {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  },
  body: { telefone, role: 'assistant', conteudo: messages[0] || '' },
  json: true
});

// Salva lead qualificado
if (lead_qualificado && resumo_lead) {
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

// ===== ENVIA MENSAGENS VIA Z-API COM DELAY =====
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

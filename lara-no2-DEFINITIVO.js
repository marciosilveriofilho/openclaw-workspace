const item = $input.first().json;
const resposta = item.resposta || {};
const telefone = item.telefone;
const conteudo = resposta.content || resposta.conteudo || [];
const texto = conteudo[0] ? (conteudo[0].text || conteudo[0].texto || '') : '';

let messages = [];
let lead_qualificado = false;
let resumo_lead = '';

try {
  // Tenta encontrar JSON valido em qualquer parte do texto
  let jsonStr = texto;
  
  // Remove markdown
  jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  
  // Normaliza aspas curvas
  jsonStr = jsonStr.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
  
  // Normaliza caracteres de controle que podem quebrar o JSON
  jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F]/g, ' ');
  
  // Encontra o JSON pelo primeiro { e ultimo }
  const start = jsonStr.indexOf('{');
  const end = jsonStr.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    jsonStr = jsonStr.substring(start, end + 1);
  }
  
  // Tenta parse direto
  try {
    const dados = JSON.parse(jsonStr);
    messages = Array.isArray(dados.messages) ? dados.messages : [];
    lead_qualificado = dados.lead_qualificado === true;
    resumo_lead = dados.resumo_lead || '';
  } catch(e1) {
    // Parse falhou - extrai campos manualmente via regex
    
    // Extrai messages
    const msgMatch = jsonStr.match(/"messages"\s*:\s*\[([^\]]*)\]/s);
    if (msgMatch) {
      const msgContent = msgMatch[1];
      const individualMsgs = [];
      const regex = /"((?:[^"\\]|\\.)*)"/g;
      let match;
      while ((match = regex.exec(msgContent)) !== null) {
        individualMsgs.push(match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'));
      }
      if (individualMsgs.length > 0) messages = individualMsgs;
    }
    
    // Extrai lead_qualificado
    if (jsonStr.includes('"lead_qualificado":true') || jsonStr.includes('"lead_qualificado": true')) {
      lead_qualificado = true;
    }
    
    // Extrai resumo_lead
    const resumoMatch = jsonStr.match(/"resumo_lead"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
    if (resumoMatch) {
      resumo_lead = resumoMatch[1].replace(/\\n/g, '\n');
    }
  }
} catch(e) {
  console.log('ERRO GERAL:', e.message);
}

// Fallback se nao extraiu nada
if (messages.length === 0) {
  messages = ['Desculpe, tive um problema. Pode repetir?'];
}

// SUPABASE
const SUPABASE_URL = 'https://wzuawfgckwpexgyhlzsy.supabase.co';
const SUPABASE_KEY = 'SUPABASE_KEY_AQUI';

// Salva historico
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

// ENVIA VIA Z-API COM DELAY
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

return [{ json: { mensagem: messages[0] || '', lead_qualificado, resumo_lead, telefone } }];

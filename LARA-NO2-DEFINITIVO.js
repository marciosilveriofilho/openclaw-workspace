const item = $input.first().json;
const resposta = item.resposta || {};
const telefone = item.telefone;

// Extrai o texto da resposta - N8N pode traduzir campos para portugues
const conteudo = resposta.content || resposta.conteudo || [];
const texto = conteudo[0] ? (conteudo[0].text || conteudo[0].texto || '') : '';

let messages = [];
let lead_qualificado = false;
let resumo_lead = '';

// Limpa o texto
let textoLimpo = texto
  .replace(/```json\s*/g, '')
  .replace(/```\s*/g, '')
  .replace(/[\u201C\u201D]/g, '"')
  .replace(/[\u2018\u2019]/g, "'")
  .trim();

// Encontra o JSON
const inicio = textoLimpo.indexOf('{');
const fim = textoLimpo.lastIndexOf('}');
if (inicio !== -1 && fim !== -1) {
  textoLimpo = textoLimpo.substring(inicio, fim + 1);
}

// Tenta parsear o JSON
try {
  const dados = JSON.parse(textoLimpo);
  
  // Extrai APENAS o array messages - nunca outros campos
  if (Array.isArray(dados.messages)) {
    messages = dados.messages.filter(m => typeof m === 'string' && m.length > 0);
  }
  
  lead_qualificado = dados.lead_qualificado === true;
  resumo_lead = dados.resumo_lead || '';
  
} catch(e) {
  // JSON invalido - tenta extrair messages via regex
  const msgMatch = textoLimpo.match(/"messages"\s*:\s*\[([\s\S]*?)\]/);
  if (msgMatch) {
    try {
      const arr = JSON.parse('[' + msgMatch[1] + ']');
      messages = arr.filter(m => typeof m === 'string');
    } catch(e2) {
      const strMatch = msgMatch[1].match(/"((?:[^"\\]|\\.)*)"/g);
      if (strMatch) {
        messages = strMatch.map(s => s.replace(/^"|"$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"'));
      }
    }
  }
  
  // Verifica lead_qualificado
  if (textoLimpo.includes('"lead_qualificado":true') || textoLimpo.includes('"lead_qualificado": true')) {
    lead_qualificado = true;
  }
  
  // Extrai resumo_lead
  const resumoMatch = textoLimpo.match(/"resumo_lead"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (resumoMatch) {
    resumo_lead = resumoMatch[1].replace(/\\n/g, '\n');
  }
  
  // SE NAO EXTRAIU NADA E TEM TEXTO PURO - usa o texto diretamente como mensagem!
  if (messages.length === 0 && texto && texto.length > 5) {
    messages = [texto.trim()];
  }
}

// Garante que nenhuma mensagem contém JSON ou campos tecnicos
messages = messages.filter(m => {
  return typeof m === 'string' && 
         m.length > 0 && 
         !m.includes('"lead_qualificado"') && 
         !m.includes('"resumo_lead"') &&
         !m.includes('"messages"');
});

// Fallback seguro
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

// Busca catálogos ativos e envia pro lead
if (lead_qualificado) {
  try {
    const catalogosResp = await this.helpers.httpRequest({
      method: 'GET',
      url: `${SUPABASE_URL}/rest/v1/catalogos?ativo=eq.true&order=id.desc&limit=2`,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (catalogosResp && catalogosResp.length > 0) {
      let msgCatalogo = '📚 *Confira nossos catálogos anteriores:*\n\n';
      for (const cat of catalogosResp) {
        msgCatalogo += `🔗 *${cat.nome}*\n${cat.url}\n\n`;
      }
      msgCatalogo += '_O catálogo atual será enviado pela sua consultora no primeiro atendimento!_ 💛';
      messages.push(msgCatalogo);
    }
  } catch(eCat) {
    console.log('Erro ao buscar catálogos:', eCat.message);
  }
}

// Salva lead qualificado NO SUPABASE (antes do Z-API)
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
    body: { telefone, resumo_lead, status: 'novo', canal: 'atacado' },
    json: true
  });
}

// Notifica SDR humano quando lead qualificado
if (lead_qualificado && resumo_lead) {
  try {
    await this.helpers.httpRequest({
      method: 'POST',
      url: 'https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': 'ZAPI_CLIENT_TOKEN_AQUI'
      },
      body: {
        phone: 'NUMERO_WHATSAPP',
        message: `🔔 *Novo lead qualificado pela Lara!*\n\n${resumo_lead}\n\n📲 *Telefone:* ${telefone}`
      },
      json: true
    });
  } catch(eNotif) {
    console.log('Erro notificacao SDR:', eNotif.message);
  }
}

// ENVIA MENSAGENS VIA Z-API COM DELAY (em try-catch para nao quebrar o fluxo)
const ZAPI_URL = 'https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text';
const ZAPI_TOKEN = 'ZAPI_CLIENT_TOKEN_AQUI';

try {
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
} catch(eZapi) {
  console.log('Z-API erro (nao critico):', eZapi.message);
}

return [{ json: { mensagem: messages[0] || '', lead_qualificado, resumo_lead, telefone } }];

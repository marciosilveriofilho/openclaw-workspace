// Workflow: Handoff CRM → Representante
// Recebe quando lead é aprovado no CRM e notifica a consultora certa

const body = $input.first().json.body || $input.first().json;

const lead_id = body.lead_id || '';
const telefone = body.telefone || '';
const resumo_lead = body.resumo_lead || '';
const consultora = (body.consultora || '').toLowerCase().trim();
const status = body.status || '';

// Mapeamento consultora → número WhatsApp
const consultoras = {
  'aline': 'NUMERO_WHATSAPP',
  'ada': 'NUMERO_WHATSAPP',
  'vanessa': '', // a confirmar
  'tamilly': 'NUMERO_WHATSAPP',
  'taysmara': 'NUMERO_WHATSAPP',
  'site': 'NUMERO_WHATSAPP'
};

// Encontra o número da consultora
let numero_consultora = '';
for (const [nome, numero] of Object.entries(consultoras)) {
  if (consultora.includes(nome)) {
    numero_consultora = numero;
    break;
  }
}

// Se não encontrou consultora, notifica a SDR
if (!numero_consultora) {
  numero_consultora = 'NUMERO_WHATSAPP'; // Tamilly SDR
}

// Monta mensagem de handoff
const mensagem = `🎉 *Novo lead aprovado para você!*

${resumo_lead}

📲 *Telefone do lead:* ${telefone}

⚡ Entre em contato em até 24h!
_Enviado automaticamente pelo CRM Mariana Amaral_`;

return [{
  json: {
    numero_consultora,
    consultora: body.consultora,
    mensagem,
    telefone,
    lead_id
  }
}];

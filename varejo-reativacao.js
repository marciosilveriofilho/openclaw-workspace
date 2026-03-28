// Workflow: Reativação de Clientes Inativos — Mariana Amaral Varejo

const SUPABASE_URL = 'https://wzuawfgckwpexgyhlzsy.supabase.co';
const SUPABASE_KEY = 'SUPABASE_KEY_AQUI';
const ZAPI_URL = 'https://api.z-api.io/instances/ZAPI_INSTANCE_ID/token/ZAPI_TOKEN_ID/send-text';
const ZAPI_TOKEN = 'ZAPI_TOKEN_AQUI';

const raw = $input.first().json;
const cliente = raw.body || raw;
const nome = (cliente.nome || '').split(' ')[0];
const telefone = cliente.telefone || '';
const dias_inativo = cliente.dias_inativo || 30;

if (!telefone) {
  return [{ json: { status: 'sem_telefone' } }];
}

let mensagem = '';

if (dias_inativo >= 30 && dias_inativo < 60) {
  mensagem = `Oi${nome ? ', ' + nome : ''}! Tudo bem? 💛

Faz um tempinho que a gente não se encontra por aqui e queríamos dar um oi.

Temos novidades lindas esperando por você na Mariana Amaral ✨

👉 marianaamaral.com.br

Quando sentir vontade, a gente está aqui!`;

} else if (dias_inativo >= 60 && dias_inativo < 90) {
  mensagem = `${nome ? nome + ', s' : 'S'}entimos sua falta! 🌟

Foram quase dois meses e queremos muito te ver por aqui novamente.

Temos lançamentos incríveis que com certeza vão combinar com você.

Use o código *VOLTEI10* e ganhe 10% na sua próxima compra:
👉 marianaamaral.com.br

Com carinho, Mariana Amaral 💛`;

} else if (dias_inativo >= 90) {
  mensagem = `${nome ? nome + ', v' : 'V'}ocê faz falta aqui! 💛

Já faz um bom tempo e não queremos que você perca as novidades que preparamos.

Como um gesto especial para você voltar, preparamos:
🎁 *15% de desconto* com o código *VOLTEI15*

Válido por 7 dias:
👉 marianaamaral.com.br

Esperamos você! Com amor, Mariana Amaral ✨`;
}

if (!mensagem) {
  return [{ json: { status: 'fora_do_criterio' } }];
}

await this.helpers.httpRequest({
  method: 'POST',
  url: ZAPI_URL,
  headers: { 'Content-Type': 'application/json', 'Client-Token': ZAPI_TOKEN },
  body: { phone: telefone, message: mensagem },
  json: true
});

return [{ json: { status: 'enviado', telefone, dias_inativo } }];

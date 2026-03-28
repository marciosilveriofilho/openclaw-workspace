// Google Apps Script — Integração Dudu x Google Agenda
// Cole esse código em script.google.com e siga o guia do Dudu

const WEBHOOK_SECRET = "dudu_marcio_2026"; // não muda isso

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validação de segurança
    if (data.secret !== WEBHOOK_SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ error: "Unauthorized" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const calendar = CalendarApp.getDefaultCalendar();
    
    const title = data.title;
    const start = new Date(data.start);
    const end = new Date(data.end || data.start);
    
    // Se não tiver horário de fim, adiciona 1 hora
    if (!data.end) {
      end.setHours(end.getHours() + 1);
    }
    
    const options = {};
    if (data.description) options.description = data.description;
    if (data.location) options.location = data.location;
    
    const event = calendar.createEvent(title, start, end, options);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      eventId: event.getId(),
      title: title,
      start: start.toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Teste manual — rode isso uma vez pra verificar que tá funcionando
function testar() {
  const calendar = CalendarApp.getDefaultCalendar();
  Logger.log("Calendário: " + calendar.getName());
  Logger.log("Tudo certo! Pode publicar o script.");
}

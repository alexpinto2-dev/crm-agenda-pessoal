import axios from 'axios';
import { ENV } from './env';

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';
const BOT_TOKEN = ENV.telegramBotToken;

interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: any;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    text?: string;
    entities?: Array<{
      type: string;
      offset: number;
      length: number;
    }>;
  };
  callback_query?: {
    id: string;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat_instance: string;
    data?: string;
    message?: {
      message_id: number;
      chat: {
        id: number;
      };
    };
  };
}

/**
 * Enviar mensagem de texto para o Telegram
 */
export async function sendTelegramMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem Telegram:', error);
    throw error;
  }
}

/**
 * Enviar notificação de novo cliente
 */
export async function notifyNewClient(chatId: number, clientName: string, clientEmail: string, clientPhone: string) {
  const message = `
📱 <b>Novo Cliente Adicionado</b>

<b>Nome:</b> ${clientName}
<b>Email:</b> ${clientEmail}
<b>Telefone:</b> ${clientPhone}
<b>Status:</b> Em Qualificação

Clique em /clientes para ver mais detalhes.
  `.trim();

  return sendTelegramMessage(chatId, message);
}

/**
 * Enviar notificação de novo compromisso
 */
export async function notifyNewAppointment(
  chatId: number,
  appointmentTitle: string,
  clientName: string,
  startTime: Date,
  appointmentType: string
) {
  const formattedTime = startTime.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const typeEmoji = {
    meeting: '👥',
    call: '☎️',
    email: '📧',
    task: '✅',
    other: '📌',
  }[appointmentType] || '📌';

  const message = `
${typeEmoji} <b>Novo Compromisso Agendado</b>

<b>Título:</b> ${appointmentTitle}
<b>Cliente:</b> ${clientName}
<b>Data/Hora:</b> ${formattedTime}
<b>Tipo:</b> ${appointmentType}

Clique em /agenda para ver mais detalhes.
  `.trim();

  return sendTelegramMessage(chatId, message);
}

/**
 * Enviar lembrete de compromisso
 */
export async function sendAppointmentReminder(
  chatId: number,
  appointmentTitle: string,
  clientName: string,
  startTime: Date,
  minutesUntil: number
) {
  const formattedTime = startTime.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `
⏰ <b>Lembrete de Compromisso</b>

<b>Faltam ${minutesUntil} minutos para:</b>
<b>Título:</b> ${appointmentTitle}
<b>Cliente:</b> ${clientName}
<b>Hora:</b> ${formattedTime}

Não se esqueça! 🔔
  `.trim();

  return sendTelegramMessage(chatId, message);
}

/**
 * Enviar notificação de atualização de status do cliente
 */
export async function notifyClientStatusUpdate(
  chatId: number,
  clientName: string,
  oldStatus: string,
  newStatus: string
) {
  const statusEmoji = {
    em_qualificacao: '🔍',
    em_negociacao: '💬',
    proposta_enviada: '📤',
    cliente_fechado: '✅',
    cliente_desistiu: '❌',
  };

  const message = `
📊 <b>Atualização de Status do Cliente</b>

<b>Cliente:</b> ${clientName}
<b>Status Anterior:</b> ${oldStatus}
<b>Novo Status:</b> ${newStatus} ${statusEmoji[newStatus as keyof typeof statusEmoji] || ''}

Clique em /clientes para ver mais detalhes.
  `.trim();

  return sendTelegramMessage(chatId, message);
}

/**
 * Enviar menu de comandos
 */
export async function sendCommandMenu(chatId: number) {
  const message = `
🤖 <b>Menu de Comandos - CRM Agenda Pessoal</b>

<b>Disponíveis:</b>
/clientes - Listar clientes
/agenda - Ver agenda de compromissos
/agendar - Agendar novo compromisso
/novo_cliente - Adicionar novo cliente
/help - Ajuda

<b>Exemplo de agendamento:</b>
/agendar João Silva 06/03/2026 14:00 Reunião de vendas

<b>Exemplo de novo cliente:</b>
/novo_cliente João Silva joao@email.com 11999999999
  `.trim();

  return sendTelegramMessage(chatId, message);
}

/**
 * Parsear comando de agendamento
 */
export function parseScheduleCommand(text: string): {
  clientName: string;
  date: string;
  time: string;
  description: string;
} | null {
  // Formato: /agendar [cliente] [data] [hora] [descrição]
  const match = text.match(/\/agendar\s+(.+?)\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+(.+)/);

  if (!match) {
    return null;
  }

  return {
    clientName: match[1],
    date: match[2],
    time: match[3],
    description: match[4],
  };
}

/**
 * Parsear comando de novo cliente
 */
export function parseNewClientCommand(text: string): {
  name: string;
  email: string;
  phone: string;
} | null {
  // Formato: /novo_cliente [nome] [email] [telefone]
  const match = text.match(/\/novo_cliente\s+(.+?)\s+([^\s@]+@[^\s@]+\.[^\s@]+)\s+(.+)/);

  if (!match) {
    return null;
  }

  return {
    name: match[1],
    email: match[2],
    phone: match[3],
  };
}

/**
 * Configurar webhook do Telegram
 */
export async function setWebhook(webhookUrl: string) {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}${BOT_TOKEN}/setWebhook`, {
      url: webhookUrl,
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao configurar webhook Telegram:', error);
    throw error;
  }
}

/**
 * Remover webhook do Telegram
 */
export async function deleteWebhook() {
  try {
    const response = await axios.post(`${TELEGRAM_API_URL}${BOT_TOKEN}/deleteWebhook`);
    return response.data;
  } catch (error) {
    console.error('Erro ao remover webhook Telegram:', error);
    throw error;
  }
}

/**
 * Obter informações do bot
 */
export async function getBotInfo() {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}${BOT_TOKEN}/getMe`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter informações do bot:', error);
    throw error;
  }
}

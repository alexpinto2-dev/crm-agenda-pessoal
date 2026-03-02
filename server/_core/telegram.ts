import { ENV } from "./env";

export interface TelegramMessage {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
      title?: string;
      username?: string;
      first_name?: string;
    };
    date: number;
    text?: string;
  };
}

export class TelegramService {
  private botToken: string;
  private apiUrl = "https://api.telegram.org";

  constructor() {
    this.botToken = ENV.telegramBotToken;
    if (!this.botToken) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }
  }

  async sendMessage(chatId: number | string, text: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/bot${this.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
          }),
        }
      );

      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      console.error("[Telegram] Error sending message:", error);
      return false;
    }
  }

  async setWebhook(webhookUrl: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.apiUrl}/bot${this.botToken}/setWebhook`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: webhookUrl,
            allowed_updates: ["message", "callback_query"],
          }),
        }
      );

      const data = await response.json();
      return data.ok === true;
    } catch (error) {
      console.error("[Telegram] Error setting webhook:", error);
      return false;
    }
  }

  async getMe(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/bot${this.botToken}/getMe`);
      const data = await response.json();
      return data.ok ? data.result : null;
    } catch (error) {
      console.error("[Telegram] Error getting bot info:", error);
      return null;
    }
  }

  async sendReminder(
    chatId: number | string,
    appointmentTitle: string,
    appointmentTime: Date
  ): Promise<boolean> {
    const timeStr = appointmentTime.toLocaleString("pt-BR");
    const message = `📅 <b>Lembrete de Compromisso</b>\n\n<b>${appointmentTitle}</b>\n🕐 ${timeStr}\n\nNão esqueça!`;
    return this.sendMessage(chatId, message);
  }

  async sendAppointmentConfirmation(
    chatId: number | string,
    appointmentTitle: string,
    appointmentTime: Date,
    clientName: string
  ): Promise<boolean> {
    const timeStr = appointmentTime.toLocaleString("pt-BR");
    const message = `✅ <b>Compromisso Agendado</b>\n\n<b>${appointmentTitle}</b>\n👤 Cliente: ${clientName}\n🕐 ${timeStr}`;
    return this.sendMessage(chatId, message);
  }

  parseCommand(text: string): { command: string; args: string } | null {
    if (!text.startsWith("/")) return null;

    const parts = text.split(" ");
    const command = parts[0].substring(1).toLowerCase();
    const args = parts.slice(1).join(" ");

    return { command, args };
  }
}

export const telegramService = new TelegramService();

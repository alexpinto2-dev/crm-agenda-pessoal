import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { telegramService } from "../_core/telegram";
import { z } from "zod";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";

export const telegramRouter = router({
  // Webhook para receber mensagens do Telegram
  webhook: publicProcedure
    .input(z.any())
    .mutation(async ({ input }) => {
      try {
        const message = input.message;
        if (!message || !message.text) {
          return { ok: true };
        }

        const chatId = message.chat.id;
        const text = message.text;
        const userId = message.from.id;

        // Parse command
        const command = telegramService.parseCommand(text);

        if (command?.command === "start") {
          await telegramService.sendMessage(
            chatId,
            "👋 Bem-vindo ao CRM+ Agenda!\n\nUse os comandos:\n/agendar - Agendar um compromisso\n/clientes - Listar clientes\n/proximos - Ver próximos compromissos"
          );
        } else if (command?.command === "agendar") {
          await telegramService.sendMessage(
            chatId,
            "📅 Para agendar um compromisso, use o formato:\n/agendar [cliente] [data] [hora] [descrição]\n\nExemplo:\n/agendar João 01/03/2026 14:00 Reunião de vendas"
          );
        } else if (command?.command === "clientes") {
          const db = await getDb();
          if (db) {
            const clients = await db
              .select()
              .from(users)
              .limit(5);
            const clientList = clients
              .map((c) => `• ${c.name || "Sem nome"}`)
              .join("\n");
            await telegramService.sendMessage(
              chatId,
              `👥 Seus Clientes:\n\n${clientList || "Nenhum cliente encontrado"}`
            );
          }
        } else if (command?.command === "proximos") {
          await telegramService.sendMessage(
            chatId,
            "📅 Próximos compromissos:\n\n• Reunião com João - 01/03 às 14:00\n• Ligação para Maria - 02/03 às 10:00"
          );
        } else {
          // Resposta padrão
          await telegramService.sendMessage(
            chatId,
            "Desculpe, não entendi o comando. Use /start para ver as opções disponíveis."
          );
        }

        return { ok: true };
      } catch (error) {
        console.error("[Telegram Webhook] Error:", error);
        return { ok: false };
      }
    }),

  // Configurar webhook
  setupWebhook: protectedProcedure
    .input(z.object({ webhookUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      try {
        const success = await telegramService.setWebhook(input.webhookUrl);
        return { success };
      } catch (error) {
        console.error("[Telegram Setup] Error:", error);
        return { success: false };
      }
    }),

  // Enviar notificação de lembrete
  sendReminder: protectedProcedure
    .input(
      z.object({
        chatId: z.number(),
        appointmentTitle: z.string(),
        appointmentTime: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await telegramService.sendReminder(
          input.chatId,
          input.appointmentTitle,
          input.appointmentTime
        );
        return { success };
      } catch (error) {
        console.error("[Telegram Reminder] Error:", error);
        return { success: false };
      }
    }),

  // Enviar confirmação de agendamento
  sendConfirmation: protectedProcedure
    .input(
      z.object({
        chatId: z.number(),
        appointmentTitle: z.string(),
        appointmentTime: z.date(),
        clientName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await telegramService.sendAppointmentConfirmation(
          input.chatId,
          input.appointmentTitle,
          input.appointmentTime,
          input.clientName
        );
        return { success };
      } catch (error) {
        console.error("[Telegram Confirmation] Error:", error);
        return { success: false };
      }
    }),

  // Obter informações do bot
  getBotInfo: protectedProcedure.query(async () => {
    try {
      const botInfo = await telegramService.getMe();
      return { success: !!botInfo, botInfo };
    } catch (error) {
      console.error("[Telegram Bot Info] Error:", error);
      return { success: false, botInfo: null };
    }
  }),
});

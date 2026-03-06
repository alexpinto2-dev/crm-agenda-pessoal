import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { clients, appointments, interactions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  sendTelegramMessage,
  notifyNewClient,
  notifyNewAppointment,
  sendAppointmentReminder,
  notifyClientStatusUpdate,
  parseScheduleCommand,
  parseNewClientCommand,
} from "../_core/telegramBot";

export const telegramHandlersRouter = router({
  /**
   * Webhook para receber mensagens do Telegram
   */
  webhook: publicProcedure
    .input(
      z.object({
        update_id: z.number(),
        message: z
          .object({
            message_id: z.number(),
            from: z.object({
              id: z.number(),
              first_name: z.string(),
              username: z.string().optional(),
            }),
            chat: z.object({
              id: z.number(),
              type: z.string(),
            }),
            date: z.number(),
            text: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const chatId = input.message?.chat.id;
      const text = input.message?.text;

      if (!chatId || !text) {
        return { ok: true };
      }

      try {
        // Processar comandos
        if (text.startsWith("/start")) {
          await sendTelegramMessage(
            chatId,
            "👋 Bem-vindo ao CRM Agenda Pessoal!\n\nDigite /help para ver os comandos disponíveis."
          );
        } else if (text.startsWith("/help")) {
          await sendTelegramMessage(
            chatId,
            `📋 <b>Comandos Disponíveis:</b>

/clientes - Listar seus clientes
/agenda - Ver sua agenda de compromissos
/agendar - Agendar novo compromisso
/novo_cliente - Adicionar novo cliente
/help - Mostrar esta mensagem

<b>Exemplos:</b>
/agendar João Silva 06/03/2026 14:00 Reunião de vendas
/novo_cliente João Silva joao@email.com 11999999999`
          );
        } else if (text.startsWith("/agendar")) {
          const parsed = parseScheduleCommand(text);
          if (!parsed) {
            await sendTelegramMessage(
              chatId,
              "❌ Formato inválido.\n\nUse: /agendar [cliente] [data] [hora] [descrição]\nExemplo: /agendar João Silva 06/03/2026 14:00 Reunião"
            );
          } else {
            await sendTelegramMessage(
              chatId,
              `✅ Compromisso agendado com sucesso!\n\n📅 ${parsed.date}\n⏰ ${parsed.time}\n👤 ${parsed.clientName}\n📝 ${parsed.description}`
            );
          }
        } else if (text.startsWith("/novo_cliente")) {
          const parsed = parseNewClientCommand(text);
          if (!parsed) {
            await sendTelegramMessage(
              chatId,
              "❌ Formato inválido.\n\nUse: /novo_cliente [nome] [email] [telefone]\nExemplo: /novo_cliente João Silva joao@email.com 11999999999"
            );
          } else {
            await sendTelegramMessage(
              chatId,
              `✅ Cliente adicionado com sucesso!\n\n👤 ${parsed.name}\n📧 ${parsed.email}\n📱 ${parsed.phone}`
            );
          }
        } else if (text.startsWith("/clientes")) {
          await sendTelegramMessage(
            chatId,
            "📋 Você pode visualizar seus clientes acessando a seção 'Clientes' no CRM."
          );
        } else if (text.startsWith("/agenda")) {
          await sendTelegramMessage(
            chatId,
            "📅 Você pode visualizar sua agenda acessando a seção 'Agenda' no CRM."
          );
        } else {
          await sendTelegramMessage(
            chatId,
            "Desculpe, não entendi seu comando. Digite /help para ver os comandos disponíveis."
          );
        }
      } catch (error) {
        console.error("Erro ao processar mensagem Telegram:", error);
      }

      return { ok: true };
    }),

  /**
   * Enviar notificação de novo cliente
   */
  notifyNewClient: publicProcedure
    .input(
      z.object({
        chatId: z.number(),
        clientName: z.string(),
        clientEmail: z.string(),
        clientPhone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await notifyNewClient(
          input.chatId,
          input.clientName,
          input.clientEmail,
          input.clientPhone
        );
        return { ok: true };
      } catch (error) {
        console.error("Erro ao enviar notificação de novo cliente:", error);
        throw error;
      }
    }),

  /**
   * Enviar notificação de novo compromisso
   */
  notifyNewAppointment: publicProcedure
    .input(
      z.object({
        chatId: z.number(),
        appointmentTitle: z.string(),
        clientName: z.string(),
        startTime: z.date(),
        appointmentType: z.enum(["meeting", "call", "email", "task", "other"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await notifyNewAppointment(
          input.chatId,
          input.appointmentTitle,
          input.clientName,
          input.startTime,
          input.appointmentType
        );
        return { ok: true };
      } catch (error) {
        console.error("Erro ao enviar notificação de novo compromisso:", error);
        throw error;
      }
    }),

  /**
   * Enviar lembrete de compromisso
   */
  sendReminder: publicProcedure
    .input(
      z.object({
        chatId: z.number(),
        appointmentTitle: z.string(),
        clientName: z.string(),
        startTime: z.date(),
        minutesUntil: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await sendAppointmentReminder(
          input.chatId,
          input.appointmentTitle,
          input.clientName,
          input.startTime,
          input.minutesUntil
        );
        return { ok: true };
      } catch (error) {
        console.error("Erro ao enviar lembrete:", error);
        throw error;
      }
    }),

  /**
   * Enviar notificação de atualização de status
   */
  notifyStatusUpdate: publicProcedure
    .input(
      z.object({
        chatId: z.number(),
        clientName: z.string(),
        oldStatus: z.string(),
        newStatus: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await notifyClientStatusUpdate(
          input.chatId,
          input.clientName,
          input.oldStatus,
          input.newStatus
        );
        return { ok: true };
      } catch (error) {
        console.error("Erro ao enviar notificação de status:", error);
        throw error;
      }
    }),
});

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { gptmakerService } from "../_core/gptmaker";
import { getDb } from "../db";
import { gptmakerMessages, clients } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const gptmakerRouter = router({
  // Enviar mensagem para o agente GPT Maker
  sendMessage: protectedProcedure
    .input(
      z.object({
        clientId: z.number(),
        message: z.string().min(1),
        callbackUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        // Get client details
        const client = await db.select().from(clients).where(eq(clients.id, input.clientId)).limit(1);

        if (!client || client.length === 0) {
          throw new Error("Client not found");
        }

        const clientData = client[0];

        // Send message to GPT Maker
        const response = await gptmakerService.sendMessage({
          contextId: clientData.id.toString(),
          prompt: input.message,
          callbackUrl: input.callbackUrl,
          chatName: clientData.name,
          phone: clientData.phone || undefined,
        });

        if (!response.success) {
          throw new Error(response.error || "Failed to send message");
        }

        // Store message in database
        await db.insert(gptmakerMessages).values({
          clientId: input.clientId,
          conversationId: response.conversationId || "",
          userMessage: input.message,
          status: "sent",
        });

        return {
          success: true,
          conversationId: response.conversationId,
          message: "Message sent successfully",
        };
      } catch (error) {
        console.error("[GPT Maker Router] Error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Webhook para receber respostas do agente
  webhook: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        clientId: z.number(),
        response: z.string(),
        status: z.enum(["success", "error"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        // Find the message by conversation ID
        const messages = await db.select().from(gptmakerMessages).where(eq(gptmakerMessages.conversationId, input.conversationId)).limit(1);

        if (messages && messages.length > 0) {
          const message = messages[0];
          // Update the message with the agent response
          await db
            .update(gptmakerMessages)
            .set({
              agentResponse: input.response,
              status: input.status === "error" ? "error" : "received",
              error: input.status === "error" ? input.response : null,
            })
            .where(eq(gptmakerMessages.id, message.id));
        }

        return { success: true };
      } catch (error) {
        console.error("[GPT Maker Webhook] Error:", error);
        return { success: false };
      }
    }),

  // Listar mensagens de um cliente
  listMessages: protectedProcedure
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        const messages = await db.select().from(gptmakerMessages).where(eq(gptmakerMessages.clientId, input.clientId)).limit(50);

        return messages;
      } catch (error) {
        console.error("[GPT Maker List] Error:", error);
        return [];
      }
    }),

  // Obter informações do agente
  getAgentInfo: protectedProcedure.query(async () => {
    try {
      const agentId = process.env.GPTMAKER_AGENT_ID;
      return {
        success: true,
        agentId: agentId || "",
        configured: !!agentId,
      };
    } catch (error) {
      return {
        success: false,
        configured: false,
      };
    }
  }),
});

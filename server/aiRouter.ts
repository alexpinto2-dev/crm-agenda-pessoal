import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clients, appointments } from "../drizzle/schema";
import { OpenAI } from "openai";
import { eq, and, like } from "drizzle-orm";

const openai = new OpenAI();

export const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({
      message: z.string(),
      history: z.array(z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })).default([]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 1. Buscar contexto atual (clientes e compromissos próximos)
      const userClients = await db.select().from(clients).where(eq(clients.userId, ctx.user.id)).limit(20);
      const upcomingApts = await db.select().from(appointments)
        .where(and(eq(appointments.userId, ctx.user.id)))
        .limit(10);

      const systemPrompt = `Você é um assistente de CRM inteligente. 
Sua função é ajudar o usuário a gerenciar clientes e compromissos.
Data atual: ${new Date().toLocaleString('pt-BR')}

Clientes atuais: ${JSON.stringify(userClients.map(c => ({ id: c.id, name: c.name })))}
Compromissos: ${JSON.stringify(upcomingApts.map(a => ({ id: a.id, title: a.title, start: a.startTime })))}

Você pode executar ações chamando ferramentas fictícias. Responda sempre em Português.
Se o usuário pedir para agendar algo ou criar um cliente, extraia as informações e confirme que fará a ação.

FORMATO DE RESPOSTA PARA AÇÕES:
Se precisar criar um compromisso, inclua no final da sua resposta: [ACTION:CREATE_APPOINTMENT:{"title":"...","startTime":"ISO_DATE","type":"meeting|call|task","clientId":ID}]
Se precisar criar um cliente: [ACTION:CREATE_CLIENT:{"name":"...","email":"...","status":"lead"}]`;

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...input.history,
          { role: "user", content: input.message }
        ],
      });

      const aiContent = response.choices[0].message.content || "";
      
      // 2. Processar Ações se houver
      let finalMessage = aiContent;
      const actionRegex = /\[ACTION:(\w+):({.*?})\]/g;
      let match;

      while ((match = actionRegex.exec(aiContent)) !== null) {
        const [fullMatch, actionType, actionDataStr] = match;
        try {
          const actionData = JSON.parse(actionDataStr);
          
          if (actionType === "CREATE_APPOINTMENT") {
            await db.insert(appointments).values({
              userId: ctx.user.id,
              title: actionData.title,
              startTime: new Date(actionData.startTime),
              type: actionData.type || "meeting",
              clientId: actionData.clientId,
            });
            finalMessage = finalMessage.replace(fullMatch, "\n*(Ação executada: Compromisso agendado)*");
          } else if (actionType === "CREATE_CLIENT") {
            await db.insert(clients).values({
              userId: ctx.user.id,
              name: actionData.name,
              email: actionData.email,
              status: actionData.status || "lead",
            });
            finalMessage = finalMessage.replace(fullMatch, "\n*(Ação executada: Cliente cadastrado)*");
          }
        } catch (e) {
          console.error("Erro ao processar ação da IA:", e);
        }
      }

      return { content: finalMessage };
    }),
});

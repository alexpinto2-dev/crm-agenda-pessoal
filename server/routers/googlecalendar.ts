import { router, protectedProcedure } from "../_core/trpc";
import { googleCalendarService } from "../_core/googleCalendar";
import { z } from "zod";

export const googleCalendarRouter = router({
  // Obter URL de autorização
  getAuthUrl: protectedProcedure.query(() => {
    try {
      const authUrl = googleCalendarService.getAuthUrl();
      return { authUrl, success: true };
    } catch (error) {
      console.error("[GoogleCalendarRouter] Error getting auth URL:", error);
      return { authUrl: "", success: false };
    }
  }),

  // Trocar código por tokens
  getTokens: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const tokens = await googleCalendarService.getTokens(input.code);
        return { tokens, success: true };
      } catch (error) {
        console.error("[GoogleCalendarRouter] Error getting tokens:", error);
        return { tokens: null, success: false };
      }
    }),

  // Sincronizar todos os compromissos
  syncAllAppointments: protectedProcedure
    .input(z.object({ accessToken: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await googleCalendarService.syncAllAppointments(ctx.user.id, input.accessToken);
        return { success: true, message: "Sincronização concluída com sucesso" };
      } catch (error) {
        console.error("[GoogleCalendarRouter] Error syncing appointments:", error);
        return { success: false, message: "Erro ao sincronizar compromissos" };
      }
    }),

  // Listar eventos do Google Calendar
  listEvents: protectedProcedure
    .input(z.object({ accessToken: z.string(), maxResults: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const events = await googleCalendarService.listEvents(
          input.accessToken,
          input.maxResults || 10
        );
        return { events, success: true };
      } catch (error) {
        console.error("[GoogleCalendarRouter] Error listing events:", error);
        return { events: [], success: false };
      }
    }),

  // Criar evento
  createEvent: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        title: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date().optional(),
        clientName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const event = await googleCalendarService.createEvent(input.accessToken, {
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          clientName: input.clientName,
        });
        return { event, success: true };
      } catch (error) {
        console.error("[GoogleCalendarRouter] Error creating event:", error);
        return { event: null, success: false };
      }
    }),

  // Atualizar evento
  updateEvent: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        eventId: z.string(),
        title: z.string(),
        description: z.string().optional(),
        startTime: z.date(),
        endTime: z.date().optional(),
        clientName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const event = await googleCalendarService.updateEvent(
          input.accessToken,
          input.eventId,
          {
            title: input.title,
            description: input.description,
            startTime: input.startTime,
            endTime: input.endTime,
            clientName: input.clientName,
          }
        );
        return { event, success: true };
      } catch (error) {
        console.error("[GoogleCalendarRouter] Error updating event:", error);
        return { event: null, success: false };
      }
    }),

  // Deletar evento
  deleteEvent: protectedProcedure
    .input(z.object({ accessToken: z.string(), eventId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await googleCalendarService.deleteEvent(input.accessToken, input.eventId);
        return { success: true };
      } catch (error) {
        console.error("[GoogleCalendarRouter] Error deleting event:", error);
        return { success: false };
      }
    }),
});

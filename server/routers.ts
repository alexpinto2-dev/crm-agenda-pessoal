import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { telegramRouter } from "./routers/telegram";
import { googleCalendarRouter } from "./routers/googlecalendar";
import { z } from "zod";
import { getDb } from "./db";
import { clients, appointments, interactions, pipelineStages, notifications, webhooks } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * Clients Router
   */
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(clients).where(eq(clients.userId, ctx.user.id));
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(["lead", "prospect", "customer", "inactive"]).default("lead"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(clients).values({
          userId: ctx.user.id,
          ...input,
        });
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(["lead", "prospect", "customer", "inactive"]).optional(),
        pipelineStage: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...updateData } = input;
        const result = await db.update(clients)
          .set(updateData)
          .where(and(eq(clients.id, id), eq(clients.userId, ctx.user.id)));
        return result;
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.delete(clients)
          .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.user.id)));
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const result = await db.select().from(clients)
          .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.user.id)))
          .limit(1);
        return result.length > 0 ? result[0] : null;
      }),
  }),

  /**
   * Appointments Router
   */
  appointments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(appointments).where(eq(appointments.userId, ctx.user.id));
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(["meeting", "call", "email", "task", "other"]).default("meeting"),
        startTime: z.date(),
        endTime: z.date().optional(),
        location: z.string().optional(),
        clientId: z.number().optional(),
        notificationMinutes: z.number().default(15),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.insert(appointments).values({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["meeting", "call", "email", "task", "other"]).optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        location: z.string().optional(),
        status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...updateData } = input;
        return db.update(appointments)
          .set(updateData)
          .where(and(eq(appointments.id, id), eq(appointments.userId, ctx.user.id)));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.delete(appointments)
          .where(and(eq(appointments.id, input.id), eq(appointments.userId, ctx.user.id)));
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const result = await db.select().from(appointments)
          .where(and(eq(appointments.id, input.id), eq(appointments.userId, ctx.user.id)))
          .limit(1);
        return result.length > 0 ? result[0] : null;
      }),
  }),

  /**
   * Interactions Router
   */
  interactions: router({
    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select().from(interactions)
          .where(and(
            eq(interactions.clientId, input.clientId),
            eq(interactions.userId, ctx.user.id)
          ));
      }),

    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        type: z.enum(["meeting", "call", "email", "note", "other"]).default("note"),
        title: z.string().min(1),
        content: z.string().min(1),
        appointmentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.insert(interactions).values({
          userId: ctx.user.id,
          ...input,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.delete(interactions)
          .where(and(eq(interactions.id, input.id), eq(interactions.userId, ctx.user.id)));
      }),
  }),

  /**
   * Pipeline Stages Router
   */
  pipelineStages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(pipelineStages)
        .where(eq(pipelineStages.userId, ctx.user.id));
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        order: z.number(),
        color: z.string().default("#3B82F6"),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.insert(pipelineStages).values({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  /**
   * Notifications Router
   */
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(notifications)
        .where(eq(notifications.userId, ctx.user.id));
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.update(notifications)
          .set({ read: 1 })
          .where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      }),
  }),

  /**
   * Webhooks Router
   */
  webhooks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(webhooks)
        .where(eq(webhooks.userId, ctx.user.id));
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        url: z.string().url(),
        service: z.enum(["whatsapp", "telegram", "slack", "discord", "custom"]),
        isActive: z.number().default(1),
        events: z.string().optional(),
        headers: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.insert(webhooks).values({
          userId: ctx.user.id,
          ...input,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        url: z.string().url().optional(),
        service: z.enum(["whatsapp", "telegram", "slack", "discord", "custom"]).optional(),
        isActive: z.number().optional(),
        events: z.string().optional(),
        headers: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...updateData } = input;
        return db.update(webhooks)
          .set(updateData)
          .where(and(eq(webhooks.id, id), eq(webhooks.userId, ctx.user.id)));
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return db.delete(webhooks)
          .where(and(eq(webhooks.id, input.id), eq(webhooks.userId, ctx.user.id)));
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return null;
        
        const result = await db.select().from(webhooks)
          .where(and(eq(webhooks.id, input.id), eq(webhooks.userId, ctx.user.id)))
          .limit(1);
        return result.length > 0 ? result[0] : null;
      }),
  }),

  telegram: telegramRouter,
  googleCalendar: googleCalendarRouter,
});

export type AppRouter = typeof appRouter;

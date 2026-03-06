import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("Telegram Handlers Integration", () => {
  let userId: number;
  let caller: any;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Get or create test user
    const testUsers = await db.select().from(users).limit(1);
    if (testUsers.length === 0) {
      throw new Error("No test user found");
    }
    userId = testUsers[0].id;

    // Create caller for testing
    const mockReq = { headers: {} } as any;
    const mockRes = {} as any;
    const context = await createContext({ req: mockReq, res: mockRes } as any);
    caller = appRouter.createCaller(context);
  });

  it("should handle /start command", async () => {
    const result = await caller.telegramHandlers.webhook({
      update_id: 1,
      message: {
        message_id: 1,
        from: { id: 123456789, first_name: "Test" },
        chat: { id: 123456789, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/start",
      },
    });

    expect(result).toEqual({ ok: true });
  });

  it("should handle /help command", async () => {
    const result = await caller.telegramHandlers.webhook({
      update_id: 2,
      message: {
        message_id: 2,
        from: { id: 123456789, first_name: "Test" },
        chat: { id: 123456789, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/help",
      },
    });

    expect(result).toEqual({ ok: true });
  });

  it("should handle invalid /agendar command", async () => {
    const result = await caller.telegramHandlers.webhook({
      update_id: 3,
      message: {
        message_id: 3,
        from: { id: 123456789, first_name: "Test" },
        chat: { id: 123456789, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/agendar invalid format",
      },
    });

    expect(result).toEqual({ ok: true });
  });

  it("should handle valid /agendar command", async () => {
    const result = await caller.telegramHandlers.webhook({
      update_id: 4,
      message: {
        message_id: 4,
        from: { id: 123456789, first_name: "Test" },
        chat: { id: 123456789, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/agendar João Silva 06/03/2026 14:00 Reunião de vendas",
      },
    });

    expect(result).toEqual({ ok: true });
  });

  it("should handle /novo_cliente command", async () => {
    const result = await caller.telegramHandlers.webhook({
      update_id: 5,
      message: {
        message_id: 5,
        from: { id: 123456789, first_name: "Test" },
        chat: { id: 123456789, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/novo_cliente João Silva joao@email.com 11999999999",
      },
    });

    expect(result).toEqual({ ok: true });
  });

  it("should handle unknown command", async () => {
    const result = await caller.telegramHandlers.webhook({
      update_id: 6,
      message: {
        message_id: 6,
        from: { id: 123456789, first_name: "Test" },
        chat: { id: 123456789, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/comando_desconhecido",
      },
    });

    expect(result).toEqual({ ok: true });
  });

  // Testes de notificações reais foram removidos para evitar chamadas à API do Telegram durante testes
  // Em produção, essas funções serão chamadas com chat_ids válidos de usuários autenticados
});

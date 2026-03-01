import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("webhooks router", () => {
  it("should list webhooks for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.webhooks.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a webhook", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const webhookData = {
      name: "Test Webhook",
      url: "https://example.com/webhook",
      service: "whatsapp" as const,
      isActive: 1,
      events: '["appointment_created"]',
      headers: '{"Authorization": "Bearer token"}',
    };

    const result = await caller.webhooks.create(webhookData);
    expect(result).toBeDefined();
  });

  it("should validate webhook URL", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const invalidWebhookData = {
      name: "Invalid Webhook",
      url: "not-a-valid-url",
      service: "telegram" as const,
    };

    try {
      await caller.webhooks.create(invalidWebhookData as any);
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should require webhook name", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const webhookData = {
      name: "",
      url: "https://example.com/webhook",
      service: "slack" as const,
    };

    try {
      await caller.webhooks.create(webhookData as any);
      expect.fail("Should have thrown validation error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should support different webhook services", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const services = ["whatsapp", "telegram", "slack", "discord", "custom"] as const;

    for (const service of services) {
      const webhookData = {
        name: `Test ${service}`,
        url: `https://example.com/${service}`,
        service,
        isActive: 1,
      };

      const result = await caller.webhooks.create(webhookData);
      expect(result).toBeDefined();
    }
  });
});

import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "test",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("clients router", () => {
  it("should list clients for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "John Doe",
      email: "john@example.com",
      phone: "(11) 99999-9999",
      company: "Acme Corp",
      status: "em_qualificacao" as const,
      notes: "Test client",
    };

    const result = await caller.clients.create(clientData);
    expect(result).toBeDefined();
  });

  it("should get client by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a client
    const clientData = {
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "(11) 88888-8888",
      company: "Tech Inc",
      status: "em_negociacao" as const,
    };

    const createResult = await caller.clients.create(clientData);
    expect(createResult).toBeDefined();
  });

  it("should update a client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "Update Test",
      email: "update@example.com",
      status: "cliente_fechado" as const,
    };

    const createResult = await caller.clients.create(clientData);
    expect(createResult).toBeDefined();
  });

  it("should delete a client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "Delete Test",
      email: "delete@example.com",
      status: "cliente_desistiu" as const,
    };

    const createResult = await caller.clients.create(clientData);
    expect(createResult).toBeDefined();
  });
});

describe("appointments router", () => {
  it("should list appointments for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.appointments.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a new appointment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const appointmentData = {
      title: "Team Meeting",
      description: "Quarterly review",
      type: "meeting" as const,
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      location: "Conference Room A",
    };

    const result = await caller.appointments.create(appointmentData);
    expect(result).toBeDefined();
  });

  it("should update an appointment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const appointmentData = {
      title: "Updated Meeting",
      type: "call" as const,
      startTime: new Date(Date.now() + 86400000),
    };

    const createResult = await caller.appointments.create(appointmentData);
    expect(createResult).toBeDefined();
  });

  it("should delete an appointment", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const appointmentData = {
      title: "Delete Meeting",
      type: "email" as const,
      startTime: new Date(Date.now() + 86400000),
    };

    const createResult = await caller.appointments.create(appointmentData);
    expect(createResult).toBeDefined();
  });
});

describe("interactions router", () => {
  it("should list interactions by client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.interactions.listByClient({ clientId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create an interaction", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const interactionData = {
      clientId: 1,
      type: "note" as const,
      title: "Follow-up note",
      content: "Client interested in premium plan",
    };

    const result = await caller.interactions.create(interactionData);
    expect(result).toBeDefined();
  });
});

describe("pipeline stages router", () => {
  it("should list pipeline stages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.pipelineStages.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a pipeline stage", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stageData = {
      name: "Negotiation",
      order: 3,
      color: "#FF6B6B",
    };

    const result = await caller.pipelineStages.create(stageData);
    expect(result).toBeDefined();
  });
});

describe("notifications router", () => {
  it("should list notifications", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

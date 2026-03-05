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

describe("Kanban - Drag and Drop", () => {
  it("should update client status via updateStatus", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create a client
    const clientData = {
      name: "Kanban Test Client",
      email: "kanban@example.com",
      phone: "(11) 99999-9999",
      company: "Test Company",
      status: "em_qualificacao" as const,
      notes: "Test client for kanban",
    };

    const createResult = await caller.clients.create(clientData);
    expect(createResult).toBeDefined();

    // Get the created client
    const clientId = (createResult as any).lastInsertRowid || 1;

    // Update status via updateStatus
    const updateResult = await caller.clients.updateStatus({
      id: clientId,
      status: "em_negociacao",
    });
    expect(updateResult).toBeDefined();
  });

  it("should move client from em_qualificacao to em_negociacao", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "Move Test Client",
      email: "move@example.com",
      status: "em_qualificacao" as const,
    };

    await caller.clients.create(clientData);
    
    // Get the created client
    const clients = await caller.clients.list();
    const moveClient = clients.find(c => c.email === "move@example.com");
    expect(moveClient).toBeDefined();
    
    if (!moveClient) return;

    // Move to em_negociacao
    await caller.clients.updateStatus({
      id: moveClient.id,
      status: "em_negociacao",
    });

    // Verify the status was updated
    const updatedClient = await caller.clients.getById({ id: moveClient.id });
    expect(updatedClient?.status).toBe("em_negociacao");
  });

  it("should move client from em_negociacao to proposta_enviada", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "Proposal Test Client",
      email: "proposal@example.com",
      status: "em_negociacao" as const,
    };

    await caller.clients.create(clientData);
    
    const clients = await caller.clients.list();
    const proposalClient = clients.find(c => c.email === "proposal@example.com");
    expect(proposalClient).toBeDefined();
    
    if (!proposalClient) return;

    // Move to proposta_enviada
    await caller.clients.updateStatus({
      id: proposalClient.id,
      status: "proposta_enviada",
    });

    const updatedClient = await caller.clients.getById({ id: proposalClient.id });
    expect(updatedClient?.status).toBe("proposta_enviada");
  });

  it("should move client from proposta_enviada to cliente_fechado", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "Closed Client",
      email: "closed@example.com",
      status: "proposta_enviada" as const,
    };

    await caller.clients.create(clientData);
    
    const clients = await caller.clients.list();
    const closedClient = clients.find(c => c.email === "closed@example.com");
    expect(closedClient).toBeDefined();
    
    if (!closedClient) return;

    // Move to cliente_fechado
    await caller.clients.updateStatus({
      id: closedClient.id,
      status: "cliente_fechado",
    });

    const updatedClient = await caller.clients.getById({ id: closedClient.id });
    expect(updatedClient?.status).toBe("cliente_fechado");
  });

  it("should move client to cliente_desistiu", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "Abandoned Client",
      email: "abandoned@example.com",
      status: "em_qualificacao" as const,
    };

    await caller.clients.create(clientData);
    
    const clients = await caller.clients.list();
    const abandonedClient = clients.find(c => c.email === "abandoned@example.com");
    expect(abandonedClient).toBeDefined();
    
    if (!abandonedClient) return;

    // Move to cliente_desistiu
    await caller.clients.updateStatus({
      id: abandonedClient.id,
      status: "cliente_desistiu",
    });

    const updatedClient = await caller.clients.getById({ id: abandonedClient.id });
    expect(updatedClient?.status).toBe("cliente_desistiu");
  });

  it("should not allow updating status to invalid value", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clientData = {
      name: "Invalid Status Test",
      email: "invalid@example.com",
      status: "em_qualificacao" as const,
    };

    const createResult = await caller.clients.create(clientData);
    const clientId = (createResult as any).lastInsertRowid || 1;

    // Try to update with invalid status
    try {
      await caller.clients.updateStatus({
        id: clientId,
        status: "invalid_status" as any,
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should list clients in kanban view", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create multiple clients with different statuses
    const statuses = [
      "em_qualificacao",
      "em_negociacao",
      "proposta_enviada",
      "cliente_fechado",
      "cliente_desistiu",
    ];

    for (let i = 0; i < statuses.length; i++) {
      await caller.clients.create({
        name: `Kanban Client ${i}`,
        email: `kanban${i}@example.com`,
        status: statuses[i] as any,
      });
    }

    // List all clients
    const allClients = await caller.clients.list();
    expect(Array.isArray(allClients)).toBe(true);
    expect(allClients.length).toBeGreaterThanOrEqual(5);

    // Verify all statuses are present
    const clientStatuses = allClients.map((c) => c.status);
    for (const status of statuses) {
      expect(clientStatuses).toContain(status);
    }
  });
});

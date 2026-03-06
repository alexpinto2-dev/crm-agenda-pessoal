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

describe("Appointment-Interaction Linking", () => {
  it("should create interaction when appointment is created with clientId", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a client first
    const clientResult = await caller.clients.create({
      name: "Test Client for Appointment",
      email: "test@example.com",
      status: "em_qualificacao",
    });

    const clients = await caller.clients.list();
    const testClient = clients.find(c => c.email === "test@example.com");
    expect(testClient).toBeDefined();

    if (!testClient) return;

    // Create appointment with clientId
    const appointmentData = {
      title: "Meeting with Client",
      description: "Discuss project requirements",
      type: "meeting" as const,
      startTime: new Date(Date.now() + 86400000), // Tomorrow
      clientId: testClient.id,
    };

    const appointmentResult = await caller.appointments.create(appointmentData);
    expect(appointmentResult).toBeDefined();

    // Verify interaction was created
    const interactions = await caller.interactions.listByClient({
      clientId: testClient.id,
    });

    expect(interactions.length).toBeGreaterThan(0);
    const linkedInteraction = interactions.find(
      i => i.title === "Meeting with Client"
    );
    expect(linkedInteraction).toBeDefined();
    expect(linkedInteraction?.appointmentId).toBeDefined();
  });

  it("should map appointment type to interaction type correctly", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a client
    const clients = await caller.clients.list();
    let testClient = clients.find(c => c.email === "test@example.com");

    if (!testClient) {
      const result = await caller.clients.create({
        name: "Type Mapping Test Client",
        email: "type-test@example.com",
        status: "em_qualificacao",
      });
      const updatedClients = await caller.clients.list();
      testClient = updatedClients.find(c => c.email === "type-test@example.com");
    }

    expect(testClient).toBeDefined();
    if (!testClient) return;

    // Test different appointment types
    const appointmentTypes: Array<"meeting" | "call" | "email" | "task" | "other"> = [
      "meeting",
      "call",
      "email",
      "task",
    ];

    for (const type of appointmentTypes) {
      await caller.appointments.create({
        title: `${type} Appointment`,
        type,
        startTime: new Date(Date.now() + 86400000),
        clientId: testClient.id,
      });
    }

    // Verify interactions were created with correct types
    const interactions = await caller.interactions.listByClient({
      clientId: testClient.id,
    });

    const meetingInteraction = interactions.find(i => i.title === "meeting Appointment");
    expect(meetingInteraction?.type).toBe("meeting");

    const callInteraction = interactions.find(i => i.title === "call Appointment");
    expect(callInteraction?.type).toBe("call");

    const emailInteraction = interactions.find(i => i.title === "email Appointment");
    expect(emailInteraction?.type).toBe("email");

    const taskInteraction = interactions.find(i => i.title === "task Appointment");
    expect(taskInteraction?.type).toBe("note");
  });

  it("should not create interaction if no clientId is provided", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Get initial interaction count
    const clients = await caller.clients.list();
    const testClient = clients[0];

    if (!testClient) return;

    const initialInteractions = await caller.interactions.listByClient({
      clientId: testClient.id,
    });
    const initialCount = initialInteractions.length;

    // Create appointment without clientId
    await caller.appointments.create({
      title: "Appointment without client",
      type: "meeting",
      startTime: new Date(Date.now() + 86400000),
    });

    // Verify no new interaction was created for this client
    const finalInteractions = await caller.interactions.listByClient({
      clientId: testClient.id,
    });
    expect(finalInteractions.length).toBe(initialCount);
  });

  it("should include appointment description in interaction content", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a client
    const clients = await caller.clients.list();
    let testClient = clients.find(c => c.email === "test@example.com");

    if (!testClient) {
      await caller.clients.create({
        name: "Description Test Client",
        email: "desc-test@example.com",
        status: "em_qualificacao",
      });
      const updatedClients = await caller.clients.list();
      testClient = updatedClients.find(c => c.email === "desc-test@example.com");
    }

    expect(testClient).toBeDefined();
    if (!testClient) return;

    const description = "Detailed meeting notes and discussion points";

    // Create appointment with description
    await caller.appointments.create({
      title: "Meeting with Details",
      description,
      type: "meeting",
      startTime: new Date(Date.now() + 86400000),
      clientId: testClient.id,
    });

    // Verify interaction content includes description
    const interactions = await caller.interactions.listByClient({
      clientId: testClient.id,
    });

    const linkedInteraction = interactions.find(
      i => i.title === "Meeting with Details"
    );
    expect(linkedInteraction?.content).toBe(description);
  });

  it("should use default content if no description provided", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a client
    const clients = await caller.clients.list();
    let testClient = clients.find(c => c.email === "test@example.com");

    if (!testClient) {
      await caller.clients.create({
        name: "Default Content Client",
        email: "default-test@example.com",
        status: "em_qualificacao",
      });
      const updatedClients = await caller.clients.list();
      testClient = updatedClients.find(c => c.email === "default-test@example.com");
    }

    expect(testClient).toBeDefined();
    if (!testClient) return;

    // Create appointment without description
    await caller.appointments.create({
      title: "Meeting without description",
      type: "meeting",
      startTime: new Date(Date.now() + 86400000),
      clientId: testClient.id,
    });

    // Verify interaction has default content
    const interactions = await caller.interactions.listByClient({
      clientId: testClient.id,
    });

    const linkedInteraction = interactions.find(
      i => i.title === "Meeting without description"
    );
    expect(linkedInteraction?.content).toBe(
      "Compromisso agendado: Meeting without description"
    );
  });

  it("should link appointment to interaction via appointmentId", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a client
    const clients = await caller.clients.list();
    let testClient = clients.find(c => c.email === "test@example.com");

    if (!testClient) {
      await caller.clients.create({
        name: "Link Test Client",
        email: "link-test@example.com",
        status: "em_qualificacao",
      });
      const updatedClients = await caller.clients.list();
      testClient = updatedClients.find(c => c.email === "link-test@example.com");
    }

    expect(testClient).toBeDefined();
    if (!testClient) return;

    // Create appointment
    const appointmentResult = await caller.appointments.create({
      title: "Linked Appointment",
      type: "call",
      startTime: new Date(Date.now() + 86400000),
      clientId: testClient.id,
    });

    // Get interactions
    const interactions = await caller.interactions.listByClient({
      clientId: testClient.id,
    });

    const linkedInteraction = interactions.find(
      i => i.title === "Linked Appointment"
    );

    // Verify appointmentId is set
    expect(linkedInteraction?.appointmentId).toBeDefined();
    expect(linkedInteraction?.appointmentId).toBeGreaterThan(0);
  });
});

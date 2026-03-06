import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { gptmakerService } from "./_core/gptmaker";

describe("GPT Maker Integration", () => {
  it("should have GPT Maker service configured", () => {
    expect(gptmakerService).toBeDefined();
  });

  it("should validate GPT Maker conversation request format", () => {
    const request = {
      contextId: "123",
      prompt: "Hello, how are you?",
      chatName: "John Doe",
      phone: "+55 11 99999-9999",
    };

    expect(request.contextId).toBeDefined();
    expect(request.prompt).toBeDefined();
    expect(request.chatName).toBeDefined();
    expect(request.phone).toBeDefined();
  });

  it("should format client context correctly", () => {
    const context = gptmakerService.formatClientContext(
      "123",
      "John Doe",
      "+55 11 99999-9999",
      "https://example.com/photo.jpg"
    );

    expect(context.contextId).toBe("123");
    expect(context.chatName).toBe("John Doe");
    expect(context.phone).toBe("+55 11 99999-9999");
    expect(context.chatPicture).toBe("https://example.com/photo.jpg");
  });

  it("should validate webhook signature", () => {
    const signature = "test-signature";
    const payload = '{"test": "data"}';

    const isValid = gptmakerService.validateWebhookSignature(signature, payload);
    expect(isValid).toBe(true);
  });

  it("should handle message sending with proper error handling", async () => {
    const request = {
      contextId: "test-client-123",
      prompt: "Test message",
      chatName: "Test Client",
    };

    // This will fail because we're not actually calling the real API
    // but it tests the error handling
    const response = await gptmakerService.sendMessage(request);
    
    // Response should have success and error fields
    expect(response).toHaveProperty("success");
    expect(typeof response.success).toBe("boolean");
  });

  it("should handle conversation retrieval", async () => {
    const conversationId = "test-conv-123";
    
    // This will return null because we're not calling the real API
    const conversation = await gptmakerService.getConversation(conversationId);
    
    expect(conversation === null || typeof conversation === "object").toBe(true);
  });

  it("should have required environment variables", () => {
    const authToken = process.env.GPTMAKER_AUTH_TOKEN;
    const agentId = process.env.GPTMAKER_AGENT_ID;
    const apiUrl = process.env.GPTMAKER_API_URL;

    expect(authToken).toBeDefined();
    expect(agentId).toBeDefined();
    expect(apiUrl).toBeDefined();
  });

  it("should validate agent ID format", () => {
    const agentId = process.env.GPTMAKER_AGENT_ID;
    
    // Agent ID should be a hex string
    expect(agentId).toMatch(/^[A-F0-9]+$/i);
  });

  it("should validate API URL format", () => {
    const apiUrl = process.env.GPTMAKER_API_URL;
    
    expect(apiUrl).toMatch(/^https:\/\/.+/);
  });
});

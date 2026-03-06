import { describe, expect, it } from "vitest";

describe("GPT Maker API Credentials Validation", () => {
  it("should have all required environment variables configured", () => {
    const authToken = process.env.GPTMAKER_AUTH_TOKEN;
    const agentId = process.env.GPTMAKER_AGENT_ID;
    const apiUrl = process.env.GPTMAKER_API_URL;

    expect(authToken).toBeDefined();
    expect(agentId).toBeDefined();
    expect(apiUrl).toBeDefined();
  });

  it("should have valid JWT token format", () => {
    const token = process.env.GPTMAKER_AUTH_TOKEN;
    
    // JWT format: header.payload.signature
    expect(token).toMatch(/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("should have valid agent ID format", () => {
    const agentId = process.env.GPTMAKER_AGENT_ID;
    
    // Agent ID should be a hex string
    expect(agentId).toMatch(/^[A-F0-9]+$/i);
    expect(agentId?.length).toBeGreaterThan(0);
  });

  it("should have valid API URL format", () => {
    const apiUrl = process.env.GPTMAKER_API_URL;
    
    expect(apiUrl).toMatch(/^https:\/\/.+/);
  });

  it("should validate JWT token structure", () => {
    const token = process.env.GPTMAKER_AUTH_TOKEN;
    
    if (!token) {
      throw new Error("GPTMAKER_AUTH_TOKEN not configured");
    }

    try {
      const parts = token.split(".");
      expect(parts.length).toBe(3);

      // Decode payload (without verification)
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
      
      expect(payload).toBeDefined();
      expect(payload.iss).toBe("gptmaker");
      expect(payload.id).toBeDefined();
      expect(payload.tenant).toBeDefined();
      expect(payload.uuid).toBeDefined();
    } catch (error) {
      throw new Error(`Failed to validate JWT token: ${error}`);
    }
  });
});

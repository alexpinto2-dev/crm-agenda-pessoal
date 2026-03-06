import { describe, expect, it } from "vitest";

describe("Telegram Bot Token Validation", () => {
  it("should have valid Telegram bot token format", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    // Token format: numeric_id:alphanumeric_string
    expect(token).toBeDefined();
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
  });

  it("should validate token with Telegram API", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      // Check if the response indicates success
      expect(data).toBeDefined();
      expect(data.ok).toBe(true);
      expect(data.result).toBeDefined();
      expect(data.result.id).toBeDefined();
      expect(data.result.username).toBeDefined();
      expect(data.result.is_bot).toBe(true);
    } catch (error) {
      throw new Error(`Failed to validate Telegram token: ${error}`);
    }
  });

  it("should have correct bot ID from token", async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN not configured");
    }

    const botId = token.split(":")[0];
    expect(botId).toBe("7593960290");
  });
});

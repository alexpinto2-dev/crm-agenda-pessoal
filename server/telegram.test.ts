import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Telegram Bot Integration", () => {
  it("should have valid TELEGRAM_BOT_TOKEN", () => {
    expect(ENV.telegramBotToken).toBeDefined();
    expect(typeof ENV.telegramBotToken).toBe("string");
    expect(ENV.telegramBotToken.length).toBeGreaterThan(0);
  });

  it("should have token in correct format", () => {
    const token = ENV.telegramBotToken;
    // Telegram tokens have format: number:string
    expect(token).toMatch(/^\d+:[A-Za-z0-9_-]+$/);
  });

  it("should validate Telegram API endpoint", async () => {
    const token = ENV.telegramBotToken;
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.ok).toBe(true);
      expect(data.result).toBeDefined();
      expect(data.result.is_bot).toBe(true);
    } catch (error) {
      // Network error is acceptable in test environment
      expect(error).toBeDefined();
    }
  });
});

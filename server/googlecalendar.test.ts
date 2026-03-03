import { describe, expect, it } from "vitest";
import { ENV } from "./_core/env";

describe("Google Calendar Integration", () => {
  it("should have Google Calendar credentials configured", () => {
    expect(ENV.googleCalendarClientId).toBeDefined();
    expect(ENV.googleCalendarClientId).toMatch(/^[\d]+-[\w]+\.apps\.googleusercontent\.com$/);
    
    expect(ENV.googleCalendarClientSecret).toBeDefined();
    expect(ENV.googleCalendarClientSecret).toMatch(/^GOCSPX-/);
  });

  it("should validate Google Calendar Client ID format", () => {
    const clientId = ENV.googleCalendarClientId;
    // Google Client IDs follow the pattern: {project-number}-{random-string}.apps.googleusercontent.com
    expect(clientId).toContain(".apps.googleusercontent.com");
    expect(clientId).toMatch(/^\d+/); // Starts with project number
  });

  it("should validate Google Calendar Client Secret format", () => {
    const clientSecret = ENV.googleCalendarClientSecret;
    // Google Client Secrets typically start with GOCSPX-
    expect(clientSecret).toMatch(/^GOCSPX-/);
    expect(clientSecret.length).toBeGreaterThan(20);
  });
});

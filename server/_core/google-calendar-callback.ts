import type { Express, Request, Response } from "express";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerGoogleCalendarCallback(app: Express) {
  app.get("/api/google-calendar/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const error = getQueryParam(req, "error");

    if (error) {
      console.error("[GoogleCalendar] OAuth error:", error);
      res.redirect(302, `/?google_calendar_error=${error}`);
      return;
    }

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      // Redirect back to app with the authorization code
      // Frontend will handle exchanging it for tokens via tRPC
      res.redirect(302, `/?google_calendar_code=${code}&state=${state || ""}`);
    } catch (error) {
      console.error("[GoogleCalendar] Callback failed", error);
      res.status(500).json({ error: "Google Calendar callback failed" });
    }
  });
}

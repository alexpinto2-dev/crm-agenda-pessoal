import { google } from "googleapis";
import { ENV } from "./env";
import { getDb } from "../db";
import { appointments, clients } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class GoogleCalendarService {
  private oauth2Client: any;

  constructor() {
    // Use the correct redirect URI for Google Calendar OAuth
    const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/google-calendar/callback`;
    
    this.oauth2Client = new google.auth.OAuth2(
      ENV.googleCalendarClientId,
      ENV.googleCalendarClientSecret,
      redirectUri
    );
  }

  /**
   * Gera a URL de autorização para o usuário fazer login no Google
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
    });
  }

  /**
   * Troca o código de autorização por tokens de acesso
   */
  async getTokens(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      return tokens;
    } catch (error) {
      console.error("[GoogleCalendar] Error getting tokens:", error);
      throw error;
    }
  }

  /**
   * Cria um evento no Google Calendar
   */
  async createEvent(
    accessToken: string,
    appointment: {
      title: string;
      description?: string;
      startTime: Date;
      endTime?: Date;
      clientName?: string;
    }
  ): Promise<any> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: "v3", auth: this.oauth2Client });

      const event = {
        summary: appointment.title,
        description: appointment.description || `Cliente: ${appointment.clientName || "N/A"}`,
        start: {
          dateTime: appointment.startTime.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: (appointment.endTime || new Date(appointment.startTime.getTime() + 60 * 60 * 1000)).toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 24 * 60 }, // 1 day before
            { method: "popup", minutes: 15 }, // 15 minutes before
          ],
        },
      };

      const result = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      console.log("[GoogleCalendar] Event created:", result.data.id);
      return result.data;
    } catch (error) {
      console.error("[GoogleCalendar] Error creating event:", error);
      throw error;
    }
  }

  /**
   * Atualiza um evento no Google Calendar
   */
  async updateEvent(
    accessToken: string,
    eventId: string,
    appointment: {
      title: string;
      description?: string;
      startTime: Date;
      endTime?: Date;
      clientName?: string;
    }
  ): Promise<any> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: "v3", auth: this.oauth2Client });

      const event = {
        summary: appointment.title,
        description: appointment.description || `Cliente: ${appointment.clientName || "N/A"}`,
        start: {
          dateTime: appointment.startTime.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: (appointment.endTime || new Date(appointment.startTime.getTime() + 60 * 60 * 1000)).toISOString(),
          timeZone: "America/Sao_Paulo",
        },
      };

      const result = await calendar.events.update({
        calendarId: "primary",
        eventId,
        requestBody: event,
      });

      console.log("[GoogleCalendar] Event updated:", eventId);
      return result.data;
    } catch (error) {
      console.error("[GoogleCalendar] Error updating event:", error);
      throw error;
    }
  }

  /**
   * Deleta um evento do Google Calendar
   */
  async deleteEvent(accessToken: string, eventId: string): Promise<void> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: "v3", auth: this.oauth2Client });

      await calendar.events.delete({
        calendarId: "primary",
        eventId,
      });

      console.log("[GoogleCalendar] Event deleted:", eventId);
    } catch (error) {
      console.error("[GoogleCalendar] Error deleting event:", error);
      throw error;
    }
  }

  /**
   * Lista eventos do Google Calendar
   */
  async listEvents(accessToken: string, maxResults: number = 10): Promise<any[]> {
    try {
      this.oauth2Client.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: "v3", auth: this.oauth2Client });

      const result = await calendar.events.list({
        calendarId: "primary",
        maxResults,
        singleEvents: true,
        orderBy: "startTime",
        timeMin: new Date().toISOString(),
      });

      return result.data.items || [];
    } catch (error) {
      console.error("[GoogleCalendar] Error listing events:", error);
      throw error;
    }
  }

  /**
   * Sincroniza todos os compromissos do CRM com Google Calendar
   */
  async syncAllAppointments(userId: number, accessToken: string): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      // Buscar todos os compromissos do usuário
      const userAppointments = await db
        .select()
        .from(appointments)
        .where(eq(appointments.userId, userId));

      for (const appointment of userAppointments) {
        try {
          // Buscar cliente para incluir no evento
          const client = appointment.clientId
            ? await db
                .select()
                .from(clients)
                .where(eq(clients.id, appointment.clientId))
                .limit(1)
            : null;

          const clientName = client && client.length > 0 ? client[0].name : undefined;

          // Se o compromisso já tem googleEventId, atualizar; senão, criar novo
          if (appointment.googleEventId) {
            await this.updateEvent(accessToken, appointment.googleEventId, {
              title: appointment.title,
              description: appointment.description || undefined,
              startTime: new Date(appointment.startTime),
              endTime: appointment.endTime ? new Date(appointment.endTime) : undefined,
              clientName,
            });
          } else {
            const event = await this.createEvent(accessToken, {
              title: appointment.title,
              description: appointment.description || undefined,
              startTime: new Date(appointment.startTime),
              endTime: appointment.endTime ? new Date(appointment.endTime) : undefined,
              clientName,
            });

            // Atualizar compromisso com o ID do evento do Google Calendar
            if (event.id) {
              await db
                .update(appointments)
                .set({ googleEventId: event.id })
                .where(eq(appointments.id, appointment.id));
            }
          }
        } catch (error) {
          console.error(
            `[GoogleCalendar] Error syncing appointment ${appointment.id}:`,
            error
          );
        }
      }

      console.log("[GoogleCalendar] Sync completed for user:", userId);
    } catch (error) {
      console.error("[GoogleCalendar] Error syncing appointments:", error);
      throw error;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();

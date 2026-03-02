import { getDb } from "../db";
import { appointments, notifications } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { telegramService } from "./telegram";

export class NotificationScheduler {
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * Inicia o scheduler de notificações
   * Verifica a cada 5 minutos se há compromissos próximos
   */
  start(): void {
    if (this.checkInterval) return;

    console.log("[NotificationScheduler] Starting notification scheduler");

    // Executar imediatamente
    this.checkAndSendNotifications();

    // Executar a cada 5 minutos
    this.checkInterval = setInterval(() => {
      this.checkAndSendNotifications();
    }, 5 * 60 * 1000);
  }

  /**
   * Para o scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log("[NotificationScheduler] Stopped notification scheduler");
    }
  }

  /**
   * Verifica e envia notificações de compromissos próximos
   */
  private async checkAndSendNotifications(): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      const now = new Date();

      // Buscar compromissos nos próximos 24 horas que ainda não foram notificados
      const upcomingAppointments = await db
        .select()
        .from(appointments);

      for (const appointment of upcomingAppointments) {
        const appointmentDate = appointment.startTime instanceof Date ? appointment.startTime : new Date(appointment.startTime);
        
        // Verificar se o compromisso está nos próximos 24 horas
        const timeDiff = appointmentDate.getTime() - now.getTime();
        if (timeDiff < 0 || timeDiff > 24 * 60 * 60 * 1000) {
          continue;
        }

        // Verificar se já foi enviada notificação
        const existingNotification = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.appointmentId, appointment.id),
              eq(notifications.type, "appointment_reminder")
            )
          )
          .limit(1);

        if (existingNotification.length === 0) {
          // Enviar notificação
          const success = await telegramService.sendReminder(
            appointment.userId, // Usando userId como chatId (você pode armazenar chatId separadamente)
            appointment.title,
            appointmentDate
          );

          if (success) {
            // Registrar notificação como enviada
            await db.insert(notifications).values({
              userId: appointment.userId,
              appointmentId: appointment.id,
              title: `Lembrete: ${appointment.title}`,
              type: "appointment_reminder",
              scheduledFor: new Date(),
            });

            console.log(
              `[NotificationScheduler] Sent reminder for appointment: ${appointment.title}`
            );
          }
        }
      }
    } catch (error) {
      console.error("[NotificationScheduler] Error checking notifications:", error);
    }
  }

  /**
   * Envia notificação imediata de agendamento
   */
  async sendAppointmentNotification(
    userId: number,
    appointmentTitle: string,
    appointmentDate: Date,
    clientName: string
  ): Promise<boolean> {
    try {
      return await telegramService.sendAppointmentConfirmation(
        userId,
        appointmentTitle,
        appointmentDate,
        clientName
      );
    } catch (error) {
      console.error("[NotificationScheduler] Error sending appointment notification:", error);
      return false;
    }
  }
}

export const notificationScheduler = new NotificationScheduler();

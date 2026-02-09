import schedule from 'node-schedule';
import Reminder from '../models/Reminder';
import Notification from '../models/Notification';
import { EmailService } from './email.service';
import { Logger } from '../utils/logger';
import { NotificationType } from '../types';

export class NotificationService {
//  Start the notification scheduler
 
  static startScheduler(): void {
    // Run every 5 minutes to check for pending reminders
    schedule.scheduleJob('*/5 * * * *', async () => {
      Logger.info('Checking for pending reminders...');
      await this.processPendingReminders();
    });

    Logger.info('✅ Notification scheduler started');
  }

  // Process pending reminders
  static async processPendingReminders(): Promise<void> {
    try {
      const now = new Date();
      const reminders = await Reminder.find({
        scheduledFor: { $lte: now },
        sent: false
      })
        .populate('user')
        .populate('event')
        .populate('ticket')
        .limit(50);

      Logger.info(`Found ${reminders.length} pending reminders`);

      for (const reminder of reminders) {
        try {
          await this.sendReminder(reminder);
          reminder.sent = true;
          reminder.sentAt = new Date();
          await reminder.save();
        } catch (error) {
          Logger.error(`Failed to send reminder ${reminder._id}:`, error);
        }
      }
    } catch (error) {
      Logger.error('Error processing reminders:', error);
    }
  }

  // Send a single reminder
  static async sendReminder(reminder: any): Promise<void> {
    const user = reminder.user;
    const event = reminder.event;
    const ticket = reminder.ticket;

    await EmailService.sendEventReminder(user.email, {
      eventTitle: event.title,
      eventDate: event.startDate.toLocaleString(),
      venue: event.venue,
      ticketNumber: ticket.ticketNumber
    });

    Logger.info(`Reminder sent to ${user.email} for event ${event.title}`);
  }

  // Create a reminder for a ticket 
  static async createReminder(
    userId: string,
    eventId: string,
    ticketId: string,
    scheduledFor: Date
  ): Promise<void> {
    try {
      await Reminder.create({
        user: userId,
        event: eventId,
        ticket: ticketId,
        scheduledFor,
        sent: false
      });

      Logger.info(`Reminder created for ticket ${ticketId}`);
    } catch (error) {
      Logger.error('Failed to create reminder:', error);
    }
  }

  // Cancel reminders for a ticket
  static async cancelReminders(ticketId: string): Promise<void> {
    try {
      await Reminder.deleteMany({ ticket: ticketId });
      Logger.info(`Reminders cancelled for ticket ${ticketId}`);
    } catch (error) {
      Logger.error('Failed to cancel reminders:', error);
    }
  }

  // Update reminder schedule
  static async updateReminderSchedule(
    ticketId: string,
    newScheduledFor: Date
  ): Promise<void> {
    try {
      await Reminder.updateMany(
        { ticket: ticketId, sent: false },
        { scheduledFor: newScheduledFor }
      );
      Logger.info(`Reminder schedule updated for ticket ${ticketId}`);
    } catch (error) {
      Logger.error('Failed to update reminder schedule:', error);
    }
  }

  // Create in-app notification
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    data?: any
  ): Promise<void> {
    try {
      await Notification.create({
        user: userId,
        title,
        message,
        type,
        data: data || {},
        read: false
      });

      Logger.info(`Notification created for user ${userId}: ${title}`);
    } catch (error) {
      Logger.error('Failed to create notification:', error);
    }
  }

  // Create notification for event payment  
  static async notifyPaymentSuccess(
    userId: string,
    eventTitle: string,
    ticketNumber: string,
    eventId: string,
    ticketId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Payment Successful',
      `Your payment for "${eventTitle}" is confirmed. Ticket: ${ticketNumber}`,
      NotificationType.PAYMENT,
      { eventId, ticketId }
    );
  }

  // Create notification for event created
  static async notifyEventCreated(
    userId: string,
    eventTitle: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Event Created',
      `Your event "${eventTitle}" has been created successfully.`,
      NotificationType.EVENT,
      { eventId }
    );
  }

  // Create notification for event published
  static async notifyEventPublished(
    userId: string,
    eventTitle: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Event Published',
      `Your event "${eventTitle}" is now live and accepting bookings.`,
      NotificationType.EVENT,
      { eventId }
    );
  }

  // Create notification for event cancelled
  static async notifyEventCancelled(
    userId: string,
    eventTitle: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Event Cancelled',
      `Your event "${eventTitle}" has been cancelled.`,
      NotificationType.WARNING,
      { eventId }
    );
  }

  // Create notification for ticket purchase
  static async notifyTicketPurchased(
    userId: string,
    eventTitle: string,
    ticketNumber: string,
    eventId: string,
    ticketId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Ticket Purchased',
      `You have successfully purchased a ticket for "${eventTitle}". Ticket #: ${ticketNumber}`,
      NotificationType.TICKET,
      { eventId, ticketId }
    );
  }

  // Create notification for ticket scanned
  static async notifyTicketScanned(
    userId: string,
    eventTitle: string,
    ticketNumber: string,
    eventId: string
  ): Promise<void> {
    await this.createNotification(
      userId,
      'Ticket Scanned',
      `Ticket ${ticketNumber} for "${eventTitle}" has been scanned at the event.`,
      NotificationType.SUCCESS,
      { eventId, ticketNumber }
    );
  }

  // Delete old read notifications (cleanup)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        read: true,
        createdAt: { $lt: cutoffDate }
      });

      Logger.info(`Cleaned up ${result.deletedCount} old read notifications`);
    } catch (error) {
      Logger.error('Failed to cleanup old notifications:', error);
    }
  }
}

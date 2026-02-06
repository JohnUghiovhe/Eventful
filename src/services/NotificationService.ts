import nodemailer from 'nodemailer';
import { Notification, INotification, Event } from '../models';
import config from '../config/environment';

export interface CreateNotificationRequest {
  userId: string;
  eventId: string;
  type: 'reminder' | 'status_update' | 'payment_confirmation' | 'ticket_confirmation' | 'cancellation';
  title: string;
  message: string;
  notificationChannels?: Array<'email' | 'sms' | 'in_app'>;
  scheduledFor?: Date;
}

export class NotificationService {
  private static transporter = nodemailer.createTransport({
    service: config.EMAIL_SERVICE,
    auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASSWORD },
  });

  static async createNotification(data: CreateNotificationRequest): Promise<INotification | null> {
    try {
      const channels = data.notificationChannels || ['email', 'in_app'];
      const notification = await Notification.create({
        userId: data.userId,
        eventId: data.eventId,
        type: data.type,
        title: data.title,
        message: data.message,
        scheduledFor: data.scheduledFor,
        notificationChannels: channels.map(ch => ({
          channel: ch,
          status: data.scheduledFor ? 'pending' : 'sent',
        })),
      });
      if (!data.scheduledFor) await this.sendNotification(notification._id.toString());
      return notification;
    } catch (e) {
      console.error('Create notification error:', e);
      return null;
    }
  }

  static async sendNotification(notificationId: string): Promise<void> {
    try {
      const notification = await Notification.findById(notificationId).populate('userId').populate('eventId');
      if (!notification) return;
      const user = notification.userId as any;
      const event = notification.eventId as any;

      for (const channel of notification.notificationChannels) {
        try {
          if (channel.channel === 'email') {
            await this.sendEmailNotification(user, event, notification);
          }
          channel.status = 'sent';
          channel.sentAt = new Date();
        } catch (e) {
          channel.status = 'failed';
          channel.error = (e as Error).message;
        }
      }
      await notification.save();
    } catch (e) {
      console.error('Send notification error:', e);
    }
  }

  private static async sendEmailNotification(user: any, event: any, notification: INotification): Promise<void> {
    const html = `<h2>${notification.title}</h2><p>${notification.message}</p><p>Event: ${event.title}</p><p>Date: ${new Date(event.startDate).toLocaleDateString()}</p><a href="${config.FRONTEND_URL}/events/${event._id}">View Event</a>`;
    await this.transporter.sendMail({ from: config.EMAIL_FROM, to: user.email, subject: notification.title, html });
  }

  static async scheduleReminders(eventId: string): Promise<void> {
    try {
      const event = await Event.findById(eventId).populate('creator');
      if (!event) return;

      for (const reminder of event.reminderSettings.creatorReminders) {
        if (reminder.sent) continue;
        const reminderTime = new Date(event.startDate);
        reminderTime.setHours(reminderTime.getHours() - reminder.timeBefore);
        if (new Date() >= reminderTime && new Date() < event.startDate) {
          await this.createNotification({
            userId: (event.creator as any)._id.toString(),
            eventId,
            type: 'reminder',
            title: `Reminder: ${event.title}`,
            message: `Your event "${event.title}" is starting soon!`,
            notificationChannels: [reminder.type],
          });
          reminder.sent = true;
        }
      }
      await event.save();
    } catch (e) {
      console.error('Schedule reminders error:', e);
    }
  }

  static async getUserNotifications(userId: string, limit: number = 50): Promise<INotification[]> {
    try {
      return await Notification.find({ userId }).sort({ sentAt: -1 }).limit(limit).populate('eventId', 'title');
    } catch (e) {
      console.error('Fetch notifications error:', e);
      return [];
    }
  }

  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const result = await Notification.findByIdAndUpdate(notificationId, { isRead: true, readAt: new Date() });
      return !!result;
    } catch (e) {
      console.error('Mark as read error:', e);
      return false;
    }
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
      return true;
    } catch (e) {
      console.error('Mark all as read error:', e);
      return false;
    }
  }
}

export default NotificationService;

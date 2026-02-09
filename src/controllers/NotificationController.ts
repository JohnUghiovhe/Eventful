import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import NotificationService from '../services/NotificationService';
import Logger from '../utils/logger';

const err = (res: Response, code: number, msg: string) => void res.status(code).json({ status: 'error', message: msg });
const ok = (res: Response, code: number, msg: string, data?: any) => void res.status(code).json({ status: 'success', message: msg, ...(data && { data }) });

export class NotificationController {
  static async createNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('POST', '/api/notifications', req.userId);
      if (!req.userId) {
        Logger.warn('Notification creation - Unauthorized attempt');
        return void err(res, 401, 'Unauthorized');
      }
      const { eventId, type, title, message, notificationChannels, scheduledFor } = req.body;
      if (!eventId || !type || !title || !message) {
        Logger.warn('Notification creation validation failed', { eventId: !!eventId, type: !!type, title: !!title, message: !!message });
        return void err(res, 400, 'Missing required fields');
      }

      const notification = await NotificationService.createNotification({
        userId: req.userId,
        eventId,
        type,
        title,
        message,
        notificationChannels,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      });
      if (notification) {
        Logger.success('Notification created', { notificationId: notification._id, type, eventId });
        Logger.response('POST', '/api/notifications', 201, 'Notification created successfully');
        ok(res, 201, 'Notification created successfully', notification);
      } else {
        Logger.error('Notification creation failed');
        Logger.response('POST', '/api/notifications', 500, 'Creation error');
        err(res, 500, 'Creation error');
      }
    } catch (e: any) {
      Logger.error('Notification creation error', e);
      Logger.response('POST', '/api/notifications', 500, e.message || 'Creation error');
      err(res, 500, e.message || 'Creation error');
    }
  }

  static async getUserNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('GET', '/api/notifications', req.userId);
      if (!req.userId) {
        Logger.warn('Get notifications - Unauthorized attempt');
        return void err(res, 401, 'Unauthorized');
      }
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await NotificationService.getUserNotifications(req.userId, limit);
      Logger.success('Notifications retrieved', { userId: req.userId, count: notifications.length });
      Logger.response('GET', '/api/notifications', 200, `Fetched ${notifications.length} notifications`);
      ok(res, 200, 'Success', notifications);
    } catch (e: any) {
      Logger.error('Get notifications error', e);
      Logger.response('GET', '/api/notifications', 500, e.message || 'Error fetching notifications');
      err(res, 500, e.message || 'Error fetching notifications');
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('PATCH', `/api/notifications/${req.params.notificationId}/read`, req.userId);
      const success = await NotificationService.markAsRead(req.params.notificationId);
      if (success) {
        Logger.success('Notification marked as read', { notificationId: req.params.notificationId });
        Logger.response('PATCH', `/api/notifications/${req.params.notificationId}/read`, 200, 'Marked as read');
        ok(res, 200, 'Notification marked as read');
      } else {
        Logger.warn('Mark as read failed - Notification not found', { notificationId: req.params.notificationId });
        Logger.response('PATCH', `/api/notifications/${req.params.notificationId}/read`, 404, 'Not found');
        err(res, 404, 'Notification not found');
      }
    } catch (e: any) {
      Logger.error('Mark as read error', e);
      Logger.response('PATCH', `/api/notifications/${req.params.notificationId}/read`, 500, e.message || 'Error');
      err(res, 500, e.message || 'Error marking notification as read');
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('PATCH', '/api/notifications/mark-all-read', req.userId);
      if (!req.userId) {
        Logger.warn('Mark all as read - Unauthorized attempt');
        return void err(res, 401, 'Unauthorized');
      }
      const success = await NotificationService.markAllAsRead(req.userId);
      if (success) {
        Logger.success('All notifications marked as read', { userId: req.userId });
        Logger.response('PATCH', '/api/notifications/mark-all-read', 200, 'All marked as read');
        ok(res, 200, 'All notifications marked as read');
      } else {
        Logger.warn('Mark all as read failed', { userId: req.userId });
        Logger.response('PATCH', '/api/notifications/mark-all-read', 500, 'Error');
        err(res, 500, 'Error marking notifications as read');
      }
    } catch (e: any) {
      Logger.error('Mark all as read error', e);
      Logger.response('PATCH', '/api/notifications/mark-all-read', 500, e.message || 'Error');
      err(res, 500, e.message || 'Error marking notifications as read');
    }
  }
}

export default NotificationController;

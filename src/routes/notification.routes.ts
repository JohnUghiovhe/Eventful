import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/notifications
 * @desc    Create a new notification
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  apiLimiter,
  NotificationController.createNotification
);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get(
  '/',
  authenticate,
  apiLimiter,
  NotificationController.getNotifications
);

/**
 * @route   GET /api/notifications/unread/count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get(
  '/unread/count',
  authenticate,
  apiLimiter,
  NotificationController.getUnreadCount
);

/**
 * @route   GET /api/notifications/:id
 * @desc    Get a specific notification
 * @access  Private
 */
router.get(
  '/:id',
  authenticate,
  apiLimiter,
  NotificationController.getNotificationById
);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.patch(
  '/:id/read',
  authenticate,
  apiLimiter,
  NotificationController.markAsRead
);

/**
 * @route   PATCH /api/notifications/read/all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.patch(
  '/read/all',
  authenticate,
  apiLimiter,
  NotificationController.markAllAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  apiLimiter,
  NotificationController.deleteNotification
);

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications
 * @access  Private
 */
router.delete(
  '/',
  authenticate,
  apiLimiter,
  NotificationController.deleteAllNotifications
);


export default router;

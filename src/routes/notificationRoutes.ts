import { Router } from 'express';
import NotificationController from '../controllers/NotificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/', authenticateToken, NotificationController.createNotification);
router.get('/', authenticateToken, NotificationController.getUserNotifications);
router.patch('/:notificationId/read', authenticateToken, NotificationController.markAsRead);
router.patch('/mark-all-read', authenticateToken, NotificationController.markAllAsRead);

export default router;

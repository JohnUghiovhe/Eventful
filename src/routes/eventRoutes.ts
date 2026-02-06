import { Router } from 'express';
import EventController from '../controllers/EventController';
import { authenticateToken, authorizeRole, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, EventController.getAllEvents);
router.get('/:eventId', optionalAuth, EventController.getEvent);
router.get('/:eventId/share', EventController.shareEvent);

// Protected routes - Creator only
router.post('/', authenticateToken, authorizeRole('creator'), EventController.createEvent);
router.get('/user/my-events', authenticateToken, authorizeRole('creator'), EventController.getMyEvents);
router.patch('/:eventId', authenticateToken, authorizeRole('creator'), EventController.updateEvent);
router.post('/:eventId/publish', authenticateToken, authorizeRole('creator'), EventController.publishEvent);
router.post('/:eventId/cancel', authenticateToken, authorizeRole('creator'), EventController.cancelEvent);
router.get('/:eventId/analytics', authenticateToken, authorizeRole('creator'), EventController.getEventAnalytics);

export default router;

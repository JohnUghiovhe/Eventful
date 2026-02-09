import { Router } from 'express';
import PaymentController from '../controllers/PaymentController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/verify', PaymentController.verifyPayment);

// Protected routes - Eventee
router.post('/initialize', authenticateToken, authorizeRole('eventee'), PaymentController.initializePayment);
router.get('/user/my-payments', authenticateToken, PaymentController.getUserPayments);
router.post('/:transactionId/refund', authenticateToken, PaymentController.refundPayment);

// Protected routes - Creator
router.get('/events/:eventId', authenticateToken, authorizeRole('creator'), PaymentController.getEventPayments);

export default router;

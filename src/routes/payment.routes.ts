import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, isCreator, isEventee } from '../middleware/auth';
import { validateTicketPurchase, validatePaymentVerification } from '../middleware/validation';
import { paymentLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/payments/initialize
 * @desc    Initialize payment for ticket purchase
 * @access  Private (Eventee only)
 */
router.post(
  '/initialize',
  authenticate,
  isEventee,
  paymentLimiter,
  validateTicketPurchase,
  PaymentController.initializePayment
);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify payment and issue ticket
 * @access  Private (Eventee only)
 */
router.post(
  '/verify',
  authenticate,
  isEventee,
  apiLimiter,
  validatePaymentVerification,
  PaymentController.verifyPayment
);

/**
 * @route   GET /api/payments
 * @desc    Get user's payment history
 * @access  Private (Eventee only)
 */
router.get('/', authenticate, isEventee, apiLimiter, PaymentController.getMyPayments);

/**
 * @route   GET /api/payments/event/:eventId
 * @desc    Get payments for an event
 * @access  Private (Creator only)
 */
router.get(
  '/event/:eventId',
  authenticate,
  isCreator,
  apiLimiter,
  PaymentController.getEventPayments
);

export default router;

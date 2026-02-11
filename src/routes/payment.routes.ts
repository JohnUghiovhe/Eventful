import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, isCreator, isEventee } from '../middleware/auth';
import { validateTicketPurchase, validatePaymentVerification } from '../middleware/validation';
import { paymentLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/payments/initialize:
 *   post:
 *     summary: Initialize payment for ticket purchase
 *     tags: [Payments]
 *     description: Initialize Paystack payment for purchasing event tickets (Eventee only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - quantity
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     authorization_url:
 *                       type: string
 *                       example: https://checkout.paystack.com/abc123
 *                     access_code:
 *                       type: string
 *                       example: abc123xyz
 *                     reference:
 *                       type: string
 *                       example: ref_1234567890
 *       400:
 *         description: Invalid request or insufficient tickets available
 *       403:
 *         description: Forbidden - Eventee role required
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
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify payment and issue ticket
 *     tags: [Payments]
 *     description: Verify Paystack payment and generate ticket with QR code (Eventee only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *             properties:
 *               reference:
 *                 type: string
 *                 example: ref_1234567890
 *     responses:
 *       200:
 *         description: Payment verified and ticket issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Payment verification failed
 *       404:
 *         description: Payment reference not found
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
 * @swagger
 * /api/payments/verify-public:
 *   post:
 *     summary: Verify payment (public callback endpoint)
 *     tags: [Payments]
 *     description: Public endpoint for Paystack redirect callback - verifies payment and issues ticket
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reference
 *             properties:
 *               reference:
 *                 type: string
 *                 example: ref_1234567890
 *     responses:
 *       200:
 *         description: Payment verified and ticket issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment verified successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Payment verification failed
 */
router.post(
  '/verify-public',
  apiLimiter,
  validatePaymentVerification,
  PaymentController.verifyPayment
);

/**
 * @swagger
 * /api/payments/status/{reference}:
 *   get:
 *     summary: Get payment status
 *     tags: [Payments]
 *     description: Check the current status of a payment by reference (for polling)
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference
 *         example: ref_1234567890
 *     responses:
 *       200:
 *         description: Payment status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [Pending, Success, Failed]
 *                       example: Success
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 */
router.get('/status/:reference', apiLimiter, PaymentController.getPaymentStatus);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payments]
 *     description: Retrieve all payments made by the authenticated Eventee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       403:
 *         description: Forbidden - Eventee role required
 */
router.get('/', authenticate, isEventee, apiLimiter, PaymentController.getMyPayments);

/**
 * @swagger
 * /api/payments/event/{eventId}:
 *   get:
 *     summary: Get payments for an event
 *     tags: [Payments]
 *     description: Retrieve all payments for a specific event (Creator only - must be event owner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       403:
 *         description: Forbidden - Must be event creator
 *       404:
 *         description: Event not found
 */
router.get(
  '/event/:eventId',
  authenticate,
  isCreator,
  apiLimiter,
  PaymentController.getEventPayments
);

export default router;

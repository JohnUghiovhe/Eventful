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
 *     description: Initialize Paystack payment for purchasing event tickets. Role - Eventee
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
 *               - reminder
 *             properties:
 *               eventId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               reminder:
 *                 type: string
 *                 enum: [1_hour, 24_hours, 1_week]
 *                 
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
 *     description: Verify Paystack payment and generate ticket with QR code. Role - Eventee
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
 *     description: Public endpoint for Paystack redirect callback - verifies payment and issues ticket. Role - Public
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
 *     description: Check the current status of a payment by reference (for polling). Role - Public
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
 *     description: Retrieve all payments made by the authenticated Eventee. Role - Eventee
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
 *     description: Retrieve all payments for a specific event (must be event owner). Role - Creator
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

/**
 * @swagger
 * /api/payments/demo-initialize:
 *   post:
 *     summary: Initialize demo payment (Testing only - No actual payment)
 *     tags: [Payments]
 *     description: |
 *       Initialize a demo payment that completes immediately without Paystack interaction.
 *       This endpoint is for API testing purposes - it creates a payment and ticket without
 *       requiring actual payment processing. Perfect for Postman/Swagger testing.
 *       Role - Eventee (Testing only)
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
 *             properties:
 *               eventId:
 *                 type: string
 *                 description: ID of the event to purchase ticket for
 *                 example: 507f1f77bcf86cd799439011
 *               reminder:
 *                 type: string
 *                 enum: [1_hour, 24_hours, 1_week]
 *                 description: When to send event reminder
 *                 example: 24_hours
 *     responses:
 *       200:
 *         description: Demo payment completed and ticket issued
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
 *                   example: Demo payment completed successfully! Ticket issued.
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       type: object
 *                       properties:
 *                         reference:
 *                           type: string
 *                           example: DEMO-REF_1234567890
 *                         amount:
 *                           type: number
 *                           example: 5000
 *                         status:
 *                           type: string
 *                           example: success
 *                         isDemo:
 *                           type: boolean
 *                           example: true
 *                     ticket:
 *                       type: object
 *                       properties:
 *                         ticketNumber:
 *                           type: string
 *                           example: TKT-ABCDEF12-XYZ789
 *                         qrCode:
 *                           type: string
 *                           description: Base64 encoded QR code image
 *                         status:
 *                           type: string
 *                           example: paid
 *                         eventTitle:
 *                           type: string
 *                         eventDate:
 *                           type: string
 *                         venue:
 *                           type: string
 *       400:
 *         description: Bad request - Invalid input or no tickets available
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Event not found
 */
router.post(
  '/demo-initialize',
  authenticate,
  isEventee,
  paymentLimiter,
  validateTicketPurchase,
  PaymentController.initializeDemoPayment
);

export default router;

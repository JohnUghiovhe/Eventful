import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate, isCreator, isEventee } from '../middleware/auth';
import { validateUpdateReminder } from '../middleware/validation';
import { apiLimiter, scanLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/tickets:
 *   get:
 *     summary: Get user's tickets
 *     tags: [Tickets]
 *     description: Retrieve all tickets purchased by the authenticated Eventee. Role - Eventee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tickets retrieved successfully
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
 *                     $ref: '#/components/schemas/Ticket'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Eventee role required
 */
router.get('/', authenticate, isEventee, apiLimiter, TicketController.getMyTickets);

/**
 * @swagger
 * /api/tickets/{id}:
 *   get:
 *     summary: Get ticket by ID
 *     tags: [Tickets]
 *     description: Retrieve detailed information about a specific ticket. Role - Eventee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       403:
 *         description: Forbidden - Eventee role required
 */
router.get('/:id', authenticate, isEventee, apiLimiter, TicketController.getTicketById);

/**
 * @swagger
 * /api/tickets/verify/{ticketNumber}:
 *   get:
 *     summary: Verify ticket with QR code
 *     tags: [Tickets]
 *     description: Verify a ticket's authenticity using its ticket number. Role - Creator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket number (e.g., TKT-1234567890)
 *         example: TKT-1234567890
 *     responses:
 *       200:
 *         description: Ticket verified successfully
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
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       403:
 *         description: Forbidden - Creator role required
 */
router.get(
  '/verify/:ticketNumber',
  authenticate,
  isCreator,
  scanLimiter,
  TicketController.verifyTicket
);

/**
 * @swagger
 * /api/tickets/scan/{ticketNumber}:
 *   post:
 *     summary: Scan/Mark ticket as used
 *     tags: [Tickets]
 *     description: Scan a ticket at event entry and mark it as used. Role - Creator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ticketNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket number to scan
 *         example: TKT-1234567890
 *     responses:
 *       200:
 *         description: Ticket scanned successfully
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
 *                   example: Ticket scanned successfully
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       400:
 *         description: Ticket already used or invalid
 *       404:
 *         description: Ticket not found
 *       403:
 *         description: Forbidden - Creator role required
 */
router.post(
  '/scan/:ticketNumber',
  authenticate,
  isCreator,
  scanLimiter,
  TicketController.scanTicket
);

/**
 * @swagger
 * /api/tickets/verify:
 *   post:
 *     summary: Verify ticket by ticket number and event ID
 *     tags: [Tickets]
 *     description: Verify a ticket belongs to a specific event. Role - Creator
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketNumber
 *               - eventId
 *             properties:
 *               ticketNumber:
 *                 type: string
 *                 example: TKT-1234567890
 *               eventId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Ticket verification result
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
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     ticket:
 *                       $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found or doesn't belong to event
 *       403:
 *         description: Forbidden - Creator role required
 */
router.post(
  '/verify',
  authenticate,
  isCreator,
  scanLimiter,
  TicketController.verifyTicketForEvent
);

/**
 * @swagger
 * /api/tickets/{id}/mark-used:
 *   patch:
 *     summary: Mark ticket as used
 *     tags: [Tickets]
 *     description: Manually mark a ticket as used. Role - Creator
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     responses:
 *       200:
 *         description: Ticket marked as used
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
 *                   example: Ticket marked as used
 *                 data:
 *                   $ref: '#/components/schemas/Ticket'
 *       404:
 *         description: Ticket not found
 *       403:
 *         description: Forbidden - Creator role required
 */
router.patch(
  '/:id/mark-used',
  authenticate,
  isCreator,
  apiLimiter,
  TicketController.markTicketAsUsed
);

/**
 * @swagger
 * /api/tickets/{id}/reminder:
 *   put:
 *     summary: Update ticket reminder
 *     tags: [Tickets]
 *     description: Set or update reminder preferences for a ticket. Role - Eventee
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reminderEnabled:
 *                 type: boolean
 *                 example: true
 *               reminderTime:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-24T10:00:00Z
 *     responses:
 *       200:
 *         description: Reminder updated successfully
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
 *                   example: Reminder updated successfully
 *       404:
 *         description: Ticket not found
 *       403:
 *         description: Forbidden - Eventee role required
 */
router.put(
  '/:id/reminder',
  authenticate,
  isEventee,
  apiLimiter,
  validateUpdateReminder,
  TicketController.updateReminder
);

/**
 * @swagger
 * /api/tickets/event/{eventId}/attendees:
 *   get:
 *     summary: Get attendees for an event
 *     tags: [Tickets]
 *     description: Retrieve list of all attendees who purchased tickets for an event. Role - Creator
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
 *         description: Attendees retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       ticket:
 *                         $ref: '#/components/schemas/Ticket'
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *       404:
 *         description: Event not found
 *       403:
 *         description: Forbidden - Must be event creator
 */
router.get(
  '/event/:eventId/attendees',
  authenticate,
  isCreator,
  apiLimiter,
  TicketController.getEventAttendees
);

export default router;

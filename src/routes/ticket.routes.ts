import { Router } from 'express';
import { TicketController } from '../controllers/ticket.controller';
import { authenticate, isCreator, isEventee } from '../middleware/auth';
import { validateUpdateReminder } from '../middleware/validation';
import { apiLimiter, scanLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/tickets
 * @desc    Get user's tickets
 * @access  Private (Eventee only)
 */
router.get('/', authenticate, isEventee, apiLimiter, TicketController.getMyTickets);

/**
 * @route   GET /api/tickets/:id
 * @desc    Get ticket by ID
 * @access  Private (Eventee only)
 */
router.get('/:id', authenticate, isEventee, apiLimiter, TicketController.getTicketById);

/**
 * @route   GET /api/tickets/verify/:ticketNumber
 * @desc    Verify ticket with QR code
 * @access  Private (Creator only)
 */
router.get(
  '/verify/:ticketNumber',
  authenticate,
  isCreator,
  scanLimiter,
  TicketController.verifyTicket
);

/**
 * @route   POST /api/tickets/scan/:ticketNumber
 * @desc    Scan/Mark ticket as used
 * @access  Private (Creator only)
 */
router.post(
  '/scan/:ticketNumber',
  authenticate,
  isCreator,
  scanLimiter,
  TicketController.scanTicket
);

/**
 * @route   POST /api/tickets/verify
 * @desc    Verify ticket by ticket number and event ID
 * @access  Private (Creator only)
 */
router.post(
  '/verify',
  authenticate,
  isCreator,
  scanLimiter,
  TicketController.verifyTicketForEvent
);

/**
 * @route   PATCH /api/tickets/:id/mark-used
 * @desc    Mark ticket as used
 * @access  Private (Creator only)
 */
router.patch(
  '/:id/mark-used',
  authenticate,
  isCreator,
  apiLimiter,
  TicketController.markTicketAsUsed
);

/**
 * @route   PUT /api/tickets/:id/reminder
 * @desc    Update ticket reminder
 * @access  Private (Eventee only)
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
 * @route   GET /api/tickets/event/:eventId/attendees
 * @desc    Get attendees for an event
 * @access  Private (Creator only)
 */
router.get(
  '/event/:eventId/attendees',
  authenticate,
  isCreator,
  apiLimiter,
  TicketController.getEventAttendees
);

export default router;

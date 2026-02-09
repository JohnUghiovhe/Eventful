import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate, isCreator } from '../middleware/auth';
import { validateEvent } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Private (Creator only)
 */
router.post(
  '/',
  authenticate,
  isCreator,
  apiLimiter,
  validateEvent,
  EventController.createEvent
);

/**
 * @route   GET /api/events
 * @desc    Get all published events (Authenticated users only)
 * @access  Private
 */
router.get('/', authenticate, apiLimiter, EventController.getAllEvents);

/**
 * @route   GET /api/events/my-events
 * @desc    Get events created by current user
 * @access  Private (Creator only)
 */
router.get('/my-events', authenticate, isCreator, apiLimiter, EventController.getMyEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID (Authenticated users only)
 * @access  Private
 */
router.get('/:id', authenticate, apiLimiter, EventController.getEventById);

/**
 * @route   GET /api/events/:id/share
 * @desc    Get share links for an event (Authenticated users only)
 * @access  Private
 */
router.get('/:id/share', authenticate, apiLimiter, EventController.getShareLinks);

/**
 * @route   PATCH /api/events/:id/status
 * @desc    Update event status (publish, cancel, etc.)
 * @access  Private (Creator only, own events)
 */
router.patch(
  '/:id/status',
  authenticate,
  isCreator,
  apiLimiter,
  EventController.updateEventStatus
);

/**
 * @route   PUT /api/events/:id
 * @desc    Update an event
 * @access  Private (Creator only, own events)
 */
router.put(
  '/:id',
  authenticate,
  isCreator,
  apiLimiter,
  validateEvent,
  EventController.updateEvent
);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete an event
 * @access  Private (Creator only, own events)
 */
router.delete('/:id', authenticate, isCreator, apiLimiter, EventController.deleteEvent);

export default router;

import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { authenticate, isCreator } from '../middleware/auth';
import { validateEvent } from '../middleware/validation';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     description: Create a new event (Creator role required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - date
 *               - location
 *               - price
 *               - totalTickets
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tech Conference 2026
 *               description:
 *                 type: string
 *                 example: Annual technology conference featuring industry leaders
 *               category:
 *                 type: string
 *                 enum: [Music, Sports, Arts, Technology, Business, Food, Other]
 *                 example: Technology
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-12-25T10:00:00Z
 *               location:
 *                 type: string
 *                 example: Convention Center, Lagos
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 5000
 *               totalTickets:
 *                 type: number
 *                 minimum: 1
 *                 example: 500
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ["https://example.com/image1.jpg"]
 *     responses:
 *       201:
 *         description: Event created successfully
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
 *                   example: Event created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized - User must be logged in
 *       403:
 *         description: Forbidden - Creator role required
 *       400:
 *         description: Invalid input data
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
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all published events
 *     tags: [Events]
 *     description: Retrieve all published events with optional filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Music, Sports, Arts, Technology, Business, Food, Other]
 *         description: Filter by event category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, or location
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of events per page
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *                     $ref: '#/components/schemas/Event'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, apiLimiter, EventController.getAllEvents);

/**
 * @swagger
 * /api/events/my-events:
 *   get:
 *     summary: Get events created by current user
 *     tags: [Events]
 *     description: Retrieve all events created by the authenticated Creator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's events retrieved successfully
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
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Creator role required
 */
router.get('/my-events', authenticate, isCreator, apiLimiter, EventController.getMyEvents);

/**
 * @swagger
 * /api/events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     description: Retrieve detailed information about a specific event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, apiLimiter, EventController.getEventById);

/**
 * @swagger
 * /api/events/{id}/share:
 *   get:
 *     summary: Get share links for an event
 *     tags: [Events]
 *     description: Generate social media share links for an event
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Share links generated successfully
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
 *                     facebook:
 *                       type: string
 *                     twitter:
 *                       type: string
 *                     whatsapp:
 *                       type: string
 *                     linkedin:
 *                       type: string
 *       404:
 *         description: Event not found
 */
router.get('/:id/share', authenticate, apiLimiter, EventController.getShareLinks);

/**
 * @swagger
 * /api/events/{id}/status:
 *   patch:
 *     summary: Update event status
 *     tags: [Events]
 *     description: Update event status (publish, cancel, complete) - Creator only
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Draft, Published, Cancelled, Completed]
 *                 example: Published
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       403:
 *         description: Forbidden - Not the event creator
 *       404:
 *         description: Event not found
 */
router.patch(
  '/:id/status',
  authenticate,
  isCreator,
  apiLimiter,
  EventController.updateEventStatus
);

/**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     description: Update event details - Creator only (must be event owner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               price:
 *                 type: number
 *               totalTickets:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Event'
 *       403:
 *         description: Forbidden - Not the event creator
 *       404:
 *         description: Event not found
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
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     description: Delete an event - Creator only (must be event owner)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
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
 *                   example: Event deleted successfully
 *       403:
 *         description: Forbidden - Not the event creator
 *       404:
 *         description: Event not found
 */
router.delete('/:id', authenticate, isCreator, apiLimiter, EventController.deleteEvent);

export default router;

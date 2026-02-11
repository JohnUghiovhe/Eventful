import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, isCreator } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * /api/analytics/overall:
 *   get:
 *     summary: Get creator's overall analytics
 *     tags: [Analytics]
 *     description: Retrieve comprehensive analytics across all events created by the authenticated Creator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overall analytics retrieved successfully
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
 *                     totalEvents:
 *                       type: number
 *                       example: 15
 *                     totalTicketsSold:
 *                       type: number
 *                       example: 1250
 *                     totalRevenue:
 *                       type: number
 *                       example: 6250000
 *                     averageTicketPrice:
 *                       type: number
 *                       example: 5000
 *                     upcomingEvents:
 *                       type: number
 *                       example: 8
 *                     completedEvents:
 *                       type: number
 *                       example: 7
 *       403:
 *         description: Forbidden - Creator role required
 */
router.get(
  '/overall',
  authenticate,
  isCreator,
  apiLimiter,
  AnalyticsController.getOverallAnalytics
);

/**
 * @swagger
 * /api/analytics/events:
 *   get:
 *     summary: Get analytics for all creator's events
 *     tags: [Analytics]
 *     description: Retrieve detailed analytics for each event created by the authenticated Creator
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events analytics retrieved successfully
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
 *                       event:
 *                         $ref: '#/components/schemas/Event'
 *                       ticketsSold:
 *                         type: number
 *                         example: 450
 *                       revenue:
 *                         type: number
 *                         example: 2250000
 *                       attendanceRate:
 *                         type: number
 *                         example: 90
 *       403:
 *         description: Forbidden - Creator role required
 */
router.get(
  '/events',
  authenticate,
  isCreator,
  apiLimiter,
  AnalyticsController.getEventsAnalytics
);

/**
 * @swagger
 * /api/analytics/events/{eventId}:
 *   get:
 *     summary: Get analytics for a specific event
 *     tags: [Analytics]
 *     description: Retrieve detailed analytics for a specific event (Creator only - must be event owner)
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
 *         description: Event analytics retrieved successfully
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
 *                     ticketsSold:
 *                       type: number
 *                       example: 450
 *                     ticketsUsed:
 *                       type: number
 *                       example: 405
 *                     revenue:
 *                       type: number
 *                       example: 2250000
 *                     attendanceRate:
 *                       type: number
 *                       example: 90
 *                     salesByDay:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: number
 *       403:
 *         description: Forbidden - Must be event creator
 *       404:
 *         description: Event not found
 */
router.get(
  '/events/:eventId',
  authenticate,
  isCreator,
  apiLimiter,
  AnalyticsController.getEventAnalytics
);

export default router;

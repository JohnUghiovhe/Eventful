import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, isCreator } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/analytics/overall
 * @desc    Get creator's overall analytics
 * @access  Private (Creator only)
 */
router.get(
  '/overall',
  authenticate,
  isCreator,
  apiLimiter,
  AnalyticsController.getOverallAnalytics
);

/**
 * @route   GET /api/analytics/events
 * @desc    Get analytics for all creator's events
 * @access  Private (Creator only)
 */
router.get(
  '/events',
  authenticate,
  isCreator,
  apiLimiter,
  AnalyticsController.getEventsAnalytics
);

/**
 * @route   GET /api/analytics/events/:eventId
 * @desc    Get analytics for a specific event
 * @access  Private (Creator only)
 */
router.get(
  '/events/:eventId',
  authenticate,
  isCreator,
  apiLimiter,
  AnalyticsController.getEventAnalytics
);

export default router;

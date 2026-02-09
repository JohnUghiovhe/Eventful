import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import ticketRoutes from './ticket.routes';
import paymentRoutes from './payment.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Eventful API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/tickets', ticketRoutes);
router.use('/payments', paymentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);

export default router;

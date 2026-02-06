import { Router } from 'express';
import TicketController from '../controllers/TicketController';
import { authenticateToken, authorizeRole } from '../middleware/auth';

const router = Router();

// Protected routes - Eventee
router.get('/', authenticateToken, authorizeRole('eventee'), TicketController.getUserTickets);
router.get('/:ticketNumber', authenticateToken, TicketController.getTicketDetails);

// QR Code scanning (for event admins)
router.post('/:ticketNumber/scan', authenticateToken, authorizeRole('creator'), TicketController.scanQRCode);

// Event tickets (creator only)
router.get('/events/:eventId', authenticateToken, authorizeRole('creator'), TicketController.getEventTickets);

export default router;

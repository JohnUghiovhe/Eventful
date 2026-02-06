import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import PaymentService from '../services/PaymentService';
import EventService from '../services/EventService';
import Logger from '../utils/logger';

const err = (res: Response, code: number, msg: string) => void res.status(code).json({ status: 'error', message: msg });
const ok = (res: Response, code: number, data: any) => void res.status(code).json({ status: 'success', ...data });

export class PaymentController {
  static async initializePayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('POST', '/api/payments/initialize', req.userId);
      if (!req.userId) {
        Logger.warn('Payment init without auth');
        return void err(res, 401, 'Unauthorized');
      }
      const { email, amount, eventId, ticketId } = req.body;
      if (!email || !amount || !eventId || !ticketId) {
        Logger.warn('Payment init validation failed', { email, amount });
        return void err(res, 400, 'Missing required fields');
      }

      const result = await PaymentService.initializePayment({
        email,
        amount: Math.round(amount * 100),
        eventId,
        ticketId,
        payerId: req.userId,
      });
      if (result.status === 'success') {
        Logger.success('Payment initialized', { eventId, amount, email });
        ok(res, 200, result);
      } else {
        Logger.warn('Payment init failed', { message: result.message });
        err(res, 400, result.message || 'Payment failed');
      }
      Logger.response('POST', '/api/payments/initialize', res.statusCode, result.status);
    } catch (e: any) {
      Logger.error('Payment initialization error', e.message);
      err(res, 500, e.message || 'Initialization error');
    }
  }

  static async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      Logger.request('GET', `/api/payments/verify?reference=${req.query.reference}`);
      const { reference } = req.query;
      if (!reference) {
        Logger.warn('Payment verification - Missing reference');
        return void err(res, 400, 'Reference is required');
      }

      const result = await PaymentService.verifyPayment(reference as string);
      if (result.status === 'success') {
        Logger.success('Payment verified', { reference });
        Logger.response('GET', `/api/payments/verify`, 200, 'Verified');
        ok(res, 200, result);
      } else {
        Logger.warn('Payment verification failed', { reference, message: result.message });
        Logger.response('GET', `/api/payments/verify`, 400, result.message || 'Verification failed');
        err(res, 400, result.message || 'Verification failed');
      }
    } catch (e: any) {
      Logger.error('Payment verification error', e);
      Logger.response('GET', `/api/payments/verify`, 500, e.message || 'Verification error');
      err(res, 500, e.message || 'Verification error');
    }
  }

  static async getEventPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('GET', `/api/events/${req.params.eventId}/payments`, req.userId);
      if (!req.userId) {
        Logger.warn('Get event payments - Unauthorized attempt');
        return void err(res, 401, 'Unauthorized');
      }
      const event = await EventService.getEventById(req.params.eventId);
      if (!event || event.creator.toString() !== req.userId) {
        Logger.warn('Get event payments - Unauthorized access', { eventId: req.params.eventId, userId: req.userId });
        return void err(res, 403, 'Forbidden');
      }

      const [payments, stats] = await Promise.all([
        PaymentService.getPaymentsByEvent(req.params.eventId),
        PaymentService.getPaymentStats(req.params.eventId),
      ]);
      Logger.success('Event payments retrieved', { eventId: req.params.eventId, paymentCount: payments.length, totalAmount: stats?.totalAmount || 0 });
      Logger.response('GET', `/api/events/${req.params.eventId}/payments`, 200, `Fetched ${payments.length} payments`);
      ok(res, 200, { data: { payments, stats } });
    } catch (e: any) {
      Logger.error('Get event payments error', e);
      Logger.response('GET', `/api/events/${req.params.eventId}/payments`, 500, e.message || 'Error');
      err(res, 500, e.message || 'Error fetching payments');
    }
  }

  static async getUserPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('GET', '/api/payments', req.userId);
      if (!req.userId) {
        Logger.warn('Get user payments - Unauthorized attempt');
        return void err(res, 401, 'Unauthorized');
      }
      const payments = await PaymentService.getPaymentsByUser(req.userId);
      Logger.success('User payments retrieved', { userId: req.userId, paymentCount: payments.length });
      Logger.response('GET', '/api/payments', 200, `Fetched ${payments.length} payments`);
      ok(res, 200, { data: payments });
    } catch (e: any) {
      Logger.error('Get user payments error', e);
      Logger.response('GET', '/api/payments', 500, e.message || 'Error');
      err(res, 500, e.message || 'Error fetching payments');
    }
  }

  static async refundPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('POST', `/api/payments/${req.params.transactionId}/refund`, req.userId);
      if (!req.userId) {
        Logger.warn('Refund payment - Unauthorized attempt');
        return void err(res, 401, 'Unauthorized');
      }
      const result = await PaymentService.refundPayment(req.params.transactionId);
      if (result.status === 'success') {
        Logger.success('Payment refunded', { transactionId: req.params.transactionId, userId: req.userId });
        Logger.response('POST', `/api/payments/${req.params.transactionId}/refund`, 200, 'Refunded');
        ok(res, 200, result);
      } else {
        Logger.warn('Payment refund failed', { transactionId: req.params.transactionId, message: result.message });
        Logger.response('POST', `/api/payments/${req.params.transactionId}/refund`, 400, result.message || 'Refund failed');
        err(res, 400, result.message || 'Refund failed');
      }
    } catch (e: any) {
      Logger.error('Payment refund error', e);
      Logger.response('POST', `/api/payments/${req.params.transactionId}/refund`, 500, e.message || 'Refund error');
      err(res, 500, e.message || 'Refund error');
    }
  }
}

export default PaymentController;

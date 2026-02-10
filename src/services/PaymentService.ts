import axios from 'axios';
import { Payment, IPayment, Analytics } from '../models';
import config from '../config/environment';
import { PaymentStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export interface InitializePaymentRequest {
  email: string;
  amount: number;
  event: string;
  ticket: string;
  user: string;
  payerId?: string;
  eventId?: string;
  ticketId?: string;
}

export class PaymentService {
  private static readonly PAYSTACK_API_URL = 'https://api.paystack.co';
  private static readonly headers = { Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' };

  private static response(status: string, message: string, data?: any) {
    return { status, message, ...(data && { data }) };
  }

  private static async paystackCall(method: 'post' | 'get', path: string, payload?: any) {
    try {
      const url = `${this.PAYSTACK_API_URL}${path}`;
      const response = await (method === 'post' ? axios.post(url, payload, { headers: this.headers }) : axios.get(url, { headers: { ...this.headers } }));
      return response.data;
    } catch (e: any) {
      throw e.response?.data || e.message;
    }
  }

  static async initializePayment(data: InitializePaymentRequest): Promise<any> {
    try {
      const transactionId = `TXN-${uuidv4().substring(0, 12).toUpperCase()}`;
      const payment = await Payment.create({
        user: data.user || data.payerId,
        event: data.event || data.eventId,
        ticket: data.ticket || data.ticketId,
        amount: data.amount / 100,
        reference: transactionId,
        currency: 'NGN',
        status: 'pending',
      });

      const paystack = await this.paystackCall('post', '/transaction/initialize', {
        email: data.email,
        amount: data.amount,
        reference: transactionId,
        metadata: { eventId: data.event || data.eventId, ticketId: data.ticket || data.ticketId, userId: data.user || data.payerId },
      });

      if (!paystack.status) return this.response('error', 'Payment initialization failed');

      payment.paystackReference = paystack.data.reference;
      payment.paystackAuthorizationUrl = paystack.data.authorization_url;
      await payment.save();

      return this.response('success', 'Payment initialized', { authorizationUrl: paystack.data.authorization_url, reference: transactionId });
    } catch (e: any) {
      console.error('Initialize payment error:', e);
      return this.response('error', e.message || 'Initialization failed');
    }
  }

  static async verifyPayment(reference: string): Promise<any> {
    try {
      const paystack = await this.paystackCall('get', `/transaction/verify/${reference}`);
      if (!paystack.status || paystack.data.status !== 'success') return this.response('error', 'Verification failed');

      const payment = await Payment.findOneAndUpdate(
        { paystackReference: reference },
        { status: 'completed', paystackResponse: paystack.data },
        { new: true }
      );

      if (payment) {
        await Analytics.findOneAndUpdate({ eventId: payment.event }, {
          $inc: { totalRevenue: payment.amount, totalTicketsSold: 1 },
          lastUpdated: new Date(),
        });
      }
      return this.response('success', 'Payment verified', payment);
    } catch (e: any) {
      console.error('Verify payment error:', e);
      return this.response('error', e.message || 'Verification error');
    }
  }

  static async getPaymentsByEvent(eventId: string): Promise<IPayment[]> {
    try {
      return await Payment.find({ eventId }).populate('payerId', 'firstName lastName email').sort({ createdAt: -1 });
    } catch (e) {
      console.error('Fetch payments error:', e);
      return [];
    }
  }

  static async getPaymentsByUser(userId: string): Promise<IPayment[]> {
    try {
      return await Payment.find({ payerId: userId }).populate('eventId', 'title').sort({ createdAt: -1 });
    } catch (e) {
      console.error('Fetch user payments error:', e);
      return [];
    }
  }

  static async refundPayment(transactionId: string): Promise<any> {
    try {
      const payment = await Payment.findOne({ transactionId });
      if (!payment) return this.response('error', 'Payment not found');
      if (payment.status !== 'completed') return this.response('error', 'Only completed payments can be refunded');

      const refund = await this.paystackCall('post', '/refund', { transaction: payment.paystackReference });
      if (!refund.status) return this.response('error', 'Refund processing failed');

      payment.status = PaymentStatus.REFUNDED;
      payment.refundedAt = new Date();
      await payment.save();

      await Analytics.findOneAndUpdate({ eventId: payment.event }, {
        $inc: { totalRevenue: -payment.amount, totalRefunds: 1, refundAmount: payment.amount },
      });

      return this.response('success', 'Payment refunded successfully');
    } catch (e: any) {
      console.error('Refund payment error:', e);
      return this.response('error', e.message || 'Refund failed');
    }
  }

  static async getPaymentStats(eventId: string): Promise<any> {
    try {
      const payments = await Payment.find({ eventId, status: 'completed' });
      const totalRevenue = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
      const totalPayments = payments.length;
      return { totalRevenue, totalPayments, averagePayment: totalPayments > 0 ? totalRevenue / totalPayments : 0 };
    } catch (e) {
      console.error('Fetch stats error:', e);
      return null;
    }
  }
}

export default PaymentService;

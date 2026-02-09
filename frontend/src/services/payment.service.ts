import api from './api';
import { Payment, ApiResponse } from '../types';

interface InitializePaymentResponse {
  paymentUrl: string;
  reference: string;
  accessCode: string;
}

interface VerifyPaymentResponse {
  payment: Payment;
  ticket: any;
}

export const paymentService = {
  async initializePayment(data: {
    eventId: string;
    reminder?: string;
  }): Promise<ApiResponse<InitializePaymentResponse>> {
    const response = await api.post('/payments/initialize', data);
    return response.data;
  },

  async verifyPayment(reference: string): Promise<ApiResponse<VerifyPaymentResponse>> {
    const response = await api.post('/payments/verify', { reference });
    return response.data;
  },

  async getMyPayments(): Promise<ApiResponse<Payment[]>> {
    const response = await api.get('/payments');
    return response.data;
  },

  async getEventPayments(eventId: string): Promise<ApiResponse<{
    payments: Payment[];
    totalRevenue: number;
    totalTransactions: number;
  }>> {
    const response = await api.get(`/payments/event/${eventId}`);
    return response.data;
  },
};

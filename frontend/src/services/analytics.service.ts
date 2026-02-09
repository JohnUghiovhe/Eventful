import api from './api';
import { Analytics, EventAnalytics, ApiResponse } from '../types';

export const analyticsService = {
  async getOverallAnalytics(): Promise<ApiResponse<Analytics>> {
    const response = await api.get('/analytics');
    return response.data;
  },

  async getEventsAnalytics(): Promise<ApiResponse<EventAnalytics[]>> {
    const response = await api.get('/analytics/events');
    return response.data;
  },

  async getEventAnalytics(eventId: string): Promise<ApiResponse<{
    event: any;
    metrics: any;
    dailySales: any[];
  }>> {
    const response = await api.get(`/analytics/events/${eventId}`);
    return response.data;
  },
};

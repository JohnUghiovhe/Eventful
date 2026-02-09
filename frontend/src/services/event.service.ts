import api from './api';
import { Event, ApiResponse, PaginatedResponse, ShareLinks } from '../types';

export const eventService = {
  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Event>> {
    const response = await api.get('/events', { params });
    return response.data;
  },

  async getEventById(id: string): Promise<ApiResponse<Event>> {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  async getMyEvents(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Event>> {
    const response = await api.get('/events/my-events', { params });
    return response.data;
  },

  async createEvent(data: Partial<Event>): Promise<ApiResponse<Event>> {
    const response = await api.post('/events', data);
    return response.data;
  },

  async updateEvent(id: string, data: Partial<Event>): Promise<ApiResponse<Event>> {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  },

  async deleteEvent(id: string): Promise<ApiResponse> {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  async getShareLinks(id: string): Promise<ApiResponse<ShareLinks>> {
    const response = await api.get(`/events/${id}/share`);
    return response.data;
  },
};

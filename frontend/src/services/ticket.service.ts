import api from './api';
import { Ticket, ApiResponse, PaginatedResponse } from '../types';

export const ticketService = {
  async getMyTickets(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Ticket>> {
    const response = await api.get('/tickets', { params });
    return response.data;
  },

  async getTicketById(id: string): Promise<ApiResponse<Ticket>> {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  },

  async updateReminder(
    id: string,
    reminder: string
  ): Promise<ApiResponse<Ticket>> {
    const response = await api.put(`/tickets/${id}/reminder`, { reminder });
    return response.data;
  },

  async getEventAttendees(eventId: string): Promise<ApiResponse<{ total: number; attendees: Ticket[] }>> {
    const response = await api.get(`/tickets/event/${eventId}/attendees`);
    return response.data;
  },

  async verifyTicket(ticketNumber: string): Promise<ApiResponse<{ ticket: Ticket; valid: boolean }>> {
    const response = await api.get(`/tickets/verify/${ticketNumber}`);
    return response.data;
  },

  async scanTicket(ticketNumber: string): Promise<ApiResponse<Ticket>> {
    const response = await api.post(`/tickets/scan/${ticketNumber}`);
    return response.data;
  },
};

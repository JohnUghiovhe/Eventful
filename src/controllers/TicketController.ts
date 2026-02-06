import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import TicketService from '../services/TicketService';
import EventService from '../services/EventService';
import Logger from '../utils/logger';

const json = (res: Response, code: number, body: any) => res.status(code).json(body);
const err = (res: Response, code: number, msg: string) => json(res, code, { status: 'error', message: msg });
const ok = (res: Response, code: number, data: any) => json(res, code, { status: 'success', data });

export class TicketController {
  static async getUserTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('GET', '/api/tickets/my-tickets', req.userId);
      if (!req.userId) {
        Logger.warn('Ticket fetch without auth');
        return void err(res, 401, 'Unauthorized');
      }
      const tickets = await TicketService.getUserTickets(req.userId);
      Logger.success('Tickets retrieved', { userId: req.userId, count: tickets.length });
      ok(res, 200, tickets);
      Logger.response('GET', '/api/tickets/my-tickets', res.statusCode, `Retrieved ${tickets.length}`);
    } catch (e: any) {
      Logger.error('Fetch tickets error', e.message);
      err(res, 500, e.message || 'Fetch tickets error');
    }
  }

  static async getTicketDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const ticket = await TicketService.getTicketByNumber(req.params.ticketNumber);
      ticket ? ok(res, 200, ticket) : err(res, 404, 'Ticket not found');
    } catch (e: any) {
      err(res, 500, e.message || 'Fetch ticket error');
    }
  }

  static async scanQRCode(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await TicketService.scanQRCode(req.params.ticketNumber);
      json(res, result.status === 'success' ? 200 : 400, result);
    } catch (e: any) {
      err(res, 500, e.message || 'QR scan error');
    }
  }

  static async getEventTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) return void err(res, 401, 'Unauthorized');
      const event = await EventService.getEventById(req.params.eventId);
      if (!event || event.creator.toString() !== req.userId) return void err(res, 403, 'Forbidden');
      
      const tickets = await TicketService.getEventTickets(req.params.eventId);
      const stats = await TicketService.getEventTicketStats(req.params.eventId);
      ok(res, 200, { tickets, stats });
    } catch (e: any) {
      err(res, 500, e.message || 'Fetch event tickets error');
    }
  }
}

export default TicketController;

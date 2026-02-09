import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import EventService from '../services/EventService';
import Logger from '../utils/logger';

const json = (res: Response, code: number, body: any) => res.status(code).json(body);
const err = (res: Response, code: number, msg: string) => json(res, code, { status: 'error', message: msg });
const ok = (res: Response, code: number, msg: string, data?: any) => json(res, code, { status: 'success', message: msg, ...(data && { data }) });

export class EventController {
  static async createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('POST', '/api/events', req.userId);
      if (!req.userId) {
        Logger.warn('Event creation without auth');
        return void err(res, 401, 'Unauthorized');
      }
      if (req.user?.role !== 'creator') {
        Logger.warn('Event creation by non-creator', { userId: req.userId });
        return void err(res, 403, 'Only creators can create');
      }
      
      const { title, description, eventType, startDate, endDate, location, capacity, ticketPrice, category, tags, image, banner } = req.body;
      if (!title || !description || !eventType || !startDate || !endDate || !location || !capacity || !ticketPrice || !category) {
        Logger.warn('Event validation failed', { title });
        return void err(res, 400, 'Missing required fields');
      }
      
      const event = await EventService.createEvent(req.userId, {
        title, description, eventType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location, capacity, ticketPrice, category, tags, image, banner,
      });
      
      if (event) {
        Logger.success('Event created', { eventId: event._id, title, creatorId: req.userId });
        ok(res, 201, 'Event created', event);
      } else {
        Logger.error('Event creation failed');
        err(res, 500, 'Event creation failed');
      }
      Logger.response('POST', '/api/events', res.statusCode, event ? 'Created' : 'Failed');
    } catch (e: any) {
      Logger.error('Create event error', e.message);
      err(res, 500, e.message || 'Create event error');
    }
  }

  static async getEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      Logger.request('GET', `/api/events/${req.params.eventId}`);
      const event = await EventService.getEventById(req.params.eventId);
      if (event) {
        Logger.success('Event fetched', { eventId: req.params.eventId, title: event.title });
        ok(res, 200, 'Event', event);
      } else {
        Logger.warn('Event not found', { eventId: req.params.eventId });
        err(res, 404, 'Event not found');
      }
      Logger.response('GET', `/api/events/${req.params.eventId}`, res.statusCode, event ? 'Found' : 'Not found');
    } catch (e: any) {
      Logger.error('Fetch event error', e.message);
      err(res, 500, e.message || 'Fetch event error');
    }
  }

  static async getMyEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) return void err(res, 401, 'Unauthorized');
      const events = await EventService.getEventsByCreator(req.userId);
      ok(res, 200, 'Events', events);
    } catch (e: any) {
      err(res, 500, e.message || 'Fetch events error');
    }
  }

  static async getAllEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '20');
      const skip = parseInt((req.query.skip as string) || '0');
      const { events, total } = await EventService.getAllEvents(limit, skip, {
        category: req.query.category as string,
        city: req.query.city as string,
        eventType: req.query.eventType as string,
      });
      json(res, 200, { status: 'success', data: events, pagination: { total, limit, skip } });
    } catch (e: any) {
      err(res, 500, e.message || 'Fetch events error');
    }
  }

  static async updateEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) return void err(res, 401, 'Unauthorized');
      const event = await EventService.updateEvent(req.params.eventId, req.userId, req.body);
      event ? ok(res, 200, 'Event updated', event) : err(res, 404, 'Event not found or unauthorized');
    } catch (e: any) {
      err(res, 500, e.message || 'Update event error');
    }
  }

  static async publishEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) return void err(res, 401, 'Unauthorized');
      const success = await EventService.publishEvent(req.params.eventId, req.userId);
      success ? ok(res, 200, 'Event published') : err(res, 404, 'Event not found or unauthorized');
    } catch (e: any) {
      err(res, 500, e.message || 'Publish event error');
    }
  }

  static async cancelEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) return void err(res, 401, 'Unauthorized');
      const success = await EventService.cancelEvent(req.params.eventId, req.userId);
      success ? ok(res, 200, 'Event cancelled') : err(res, 404, 'Event not found or unauthorized');
    } catch (e: any) {
      err(res, 500, e.message || 'Cancel event error');
    }
  }

  static async getEventAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) return void err(res, 401, 'Unauthorized');
      const analytics = await EventService.getEventAnalytics(req.params.eventId, req.userId);
      analytics ? ok(res, 200, 'Analytics', analytics) : err(res, 404, 'Analytics not found');
    } catch (e: any) {
      err(res, 500, e.message || 'Fetch analytics error');
    }
  }

  static async shareEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const shareLink = await EventService.generateShareLink(req.params.eventId);
      ok(res, 200, 'Share link', {
        shareLink,
        platforms: {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
          twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
          whatsapp: `https://wa.me/?text=${encodeURIComponent(shareLink)}`,
        },
      });
    } catch (e: any) {
      err(res, 500, e.message || 'Share link error');
    }
  }
}

export default EventController;

import { Event, IEvent, Analytics } from '../models';
import { getRedisClient } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';

export interface CreateEventRequest {
  title: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate: Date;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  capacity: number;
  ticketPrice: number;
  category: string;
  tags?: string[];
  image?: string;
  banner?: string;
}

export class EventService {
  private static readonly CACHE_TTL = 3600;

  private static async cache<T>(key: string, value: T): Promise<void> {
    try {
      await getRedisClient().setEx(key, this.CACHE_TTL, JSON.stringify(value));
    } catch (e) {
      console.error('Cache set error:', e);
    }
  }

  private static async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await getRedisClient().get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  }

  private static async invalidateCache(...keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map(k => getRedisClient().del(k)));
    } catch (e) {
      console.error('Cache invalidation error:', e);
    }
  }

  static async createEvent(creatorId: string, data: CreateEventRequest): Promise<IEvent | null> {
    try {
      const event = await Event.create({ ...data, creator: creatorId, totalTickets: data.capacity, availableTickets: data.capacity });
      await Analytics.create({ eventId: event._id, creatorId });
      await this.invalidateCache(`creator:${creatorId}:events`);
      return event;
    } catch (e) {
      console.error('Create event error:', e);
      return null;
    }
  }

  static async getEventById(eventId: string): Promise<IEvent | null> {
    try {
      const cached = await this.getCache<IEvent>(`event:${eventId}`);
      if (cached) return cached;
      const event = await Event.findById(eventId).populate('creator', 'firstName lastName email phone');
      if (event) await this.cache(`event:${eventId}`, event);
      return event;
    } catch (e) {
      console.error('Fetch event error:', e);
      return null;
    }
  }

  static async getEventsByCreator(creatorId: string): Promise<IEvent[]> {
    try {
      const cached = await this.getCache<IEvent[]>(`creator:${creatorId}:events`);
      if (cached) return cached;
      const events = await Event.find({ creator: creatorId }).sort({ createdAt: -1 }).populate('creator', 'firstName lastName email');
      await this.cache(`creator:${creatorId}:events`, events);
      return events;
    } catch (e) {
      console.error('Fetch creator events error:', e);
      return [];
    }
  }

  static async getAllEvents(limit: number = 20, skip: number = 0, filters?: { category?: string; city?: string; eventType?: string }): Promise<{ events: IEvent[]; total: number }> {
    try {
      const query: any = { status: 'published' };
      if (filters?.category) query.category = filters.category;
      if (filters?.city) query['location.city'] = filters.city;
      if (filters?.eventType) query.eventType = filters.eventType;

      const [events, total] = await Promise.all([
        Event.find(query).limit(limit).skip(skip).sort({ startDate: 1 }).populate('creator', 'firstName lastName profileImage'),
        Event.countDocuments(query),
      ]);
      return { events, total };
    } catch (e) {
      console.error('Fetch events error:', e);
      return { events: [], total: 0 };
    }
  }

  static async updateEvent(eventId: string, creatorId: string, updates: Partial<CreateEventRequest>): Promise<IEvent | null> {
    try {
      const event = await Event.findOne({ _id: eventId, creator: creatorId });
      if (!event) return null;
      Object.assign(event, updates);
      await event.save();
      await this.invalidateCache(`event:${eventId}`, `creator:${creatorId}:events`);
      return event;
    } catch (e) {
      console.error('Update event error:', e);
      return null;
    }
  }

  private static async updateStatus(eventId: string, creatorId: string, status: string): Promise<boolean> {
    try {
      const result = await Event.findOneAndUpdate({ _id: eventId, creator: creatorId }, { status });
      if (result) await this.invalidateCache(`event:${eventId}`, `creator:${creatorId}:events`);
      return !!result;
    } catch (e) {
      console.error(`Update status error (${status}):`, e);
      return false;
    }
  }

  static async publishEvent(eventId: string, creatorId: string): Promise<boolean> {
    return this.updateStatus(eventId, creatorId, 'published');
  }

  static async cancelEvent(eventId: string, creatorId: string): Promise<boolean> {
    return this.updateStatus(eventId, creatorId, 'cancelled');
  }

  static async getEventAnalytics(eventId: string, creatorId: string): Promise<any | null> {
    try {
      return await Analytics.findOne({ eventId, creatorId });
    } catch (e) {
      console.error('Fetch analytics error:', e);
      return null;
    }
  }

  static async generateShareLink(eventId: string): Promise<string> {
    try {
      const shortCode = uuidv4().substring(0, 8);
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      return `${baseUrl}/events/${eventId}?ref=${shortCode}`;
    } catch (e) {
      console.error('Generate share link error:', e);
      return '';
    }
  }

  static async decreaseAvailableTickets(eventId: string, quantity: number): Promise<boolean> {
    try {
      const result = await Event.findByIdAndUpdate(eventId, { $inc: { ticketsAvailable: -quantity, attendeeCount: quantity } });
      if (result) await this.invalidateCache(`event:${eventId}`);
      return !!result;
    } catch (e) {
      console.error('Decrease tickets error:', e);
      return false;
    }
  }
}

export default EventService;

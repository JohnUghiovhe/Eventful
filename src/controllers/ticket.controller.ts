import { Response } from 'express';
import Ticket from '../models/Ticket';
import Event from '../models/Event';
import { AuthRequest, TicketStatus } from '../types';
import { NotificationService } from '../services/notification.service';
import { Logger } from '../utils/logger';
import {
  calculateReminderDate,
  getPaginationParams
} from '../utils/helpers';

export class TicketController {
  /**
   * Get user's tickets (Eventee only)
   */
  static async getMyTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, skip } = getPaginationParams(
        req.query.page as string,
        req.query.limit as string
      );

      const tickets = await Ticket.find({ user: req.user!.id })
        .populate('event', 'title startDate endDate venue location images')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Ticket.countDocuments({ user: req.user!.id });

      res.status(200).json({
        success: true,
        data: {
          tickets,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      Logger.error('Get my tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tickets'
      });
    }
  }

  /**
   * Get ticket by ID
   */
  static async getTicketById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findOne({
        _id: id,
        user: req.user!.id
      }).populate('event', 'title startDate endDate venue location images creator');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error: any) {
      Logger.error('Get ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ticket'
      });
    }
  }

  /**
   * Verify ticket with QR code (Creator only)
   */
  static async verifyTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ticketNumber } = req.params;

      const ticket = await Ticket.findOne({ ticketNumber })
        .populate('event')
        .populate('user', 'firstName lastName email');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event: any = ticket.event;

      // Check if the current user is the event creator
      if (event.creator.toString() !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Check if ticket is already used
      if (ticket.status === TicketStatus.USED) {
        res.status(400).json({
          success: false,
          message: 'Ticket already used',
          data: {
            scannedAt: ticket.scannedAt
          }
        });
        return;
      }

      // Check if payment is successful
      if (ticket.status !== TicketStatus.PAID) {
        res.status(400).json({
          success: false,
          message: 'Ticket payment not confirmed'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ticket verified',
        data: {
          ticket,
          valid: true
        }
      });
    } catch (error: any) {
      Logger.error('Verify ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify ticket'
      });
    }
  }

  /**
   * Scan/Mark ticket as used (Creator only)
   */
  static async scanTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ticketNumber } = req.params;

      const ticket = await Ticket.findOne({ ticketNumber }).populate('event');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event: any = ticket.event;

      // Check if the current user is the event creator
      if (event.creator.toString() !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Check if already scanned
      if (ticket.status === TicketStatus.USED) {
        res.status(400).json({
          success: false,
          message: 'Ticket already scanned',
          data: { scannedAt: ticket.scannedAt }
        });
        return;
      }

      // Mark as used
      ticket.status = TicketStatus.USED;
      ticket.scannedAt = new Date();
      await ticket.save();

      res.status(200).json({
        success: true,
        message: 'Ticket scanned successfully',
        data: ticket
      });
    } catch (error: any) {
      Logger.error('Scan ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to scan ticket'
      });
    }
  }

  /**
   * Update ticket reminder (Eventee only)
   */
  static async updateReminder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reminder } = req.body;

      const ticket = await Ticket.findOne({
        _id: id,
        user: req.user!.id
      }).populate('event');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event: any = ticket.event;
      const newReminderDate = calculateReminderDate(event.startDate, reminder);

      // Update ticket reminder
      ticket.reminder = reminder;
      await ticket.save();

      // Update reminder schedule
      await NotificationService.updateReminderSchedule(ticket._id.toString(), newReminderDate);

      res.status(200).json({
        success: true,
        message: 'Reminder updated successfully',
        data: ticket
      });
    } catch (error: any) {
      Logger.error('Update reminder error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update reminder'
      });
    }
  }

  /**
   * Get attendees for an event (Creator only)
   */
  static async getEventAttendees(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      // Verify event ownership
      const event = await Event.findOne({
        _id: eventId,
        creator: req.user!.id
      });

      if (!event) {
        res.status(404).json({
          success: false,
          message: 'Event not found or unauthorized'
        });
        return;
      }

      const tickets = await Ticket.find({ event: eventId, status: TicketStatus.PAID })
        .populate('user', 'firstName lastName email phoneNumber')
        .sort({ purchaseDate: -1 });

      res.status(200).json({
        success: true,
        data: {
          total: tickets.length,
          attendees: tickets
        }
      });
    } catch (error: any) {
      Logger.error('Get event attendees error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch attendees'
      });
    }
  }

  /**
   * Verify ticket by ticket number and event ID (for verification page)
   */
  static async verifyTicketForEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ticketNumber, eventId } = req.body;

      if (!ticketNumber || !eventId) {
        res.status(400).json({
          success: false,
          message: 'Ticket number and event ID are required'
        });
        return;
      }

      const ticket = await Ticket.findOne({ ticketNumber, event: eventId })
        .populate('event')
        .populate('user', 'firstName lastName email');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event: any = ticket.event;

      // Check if the current user is the event creator
      if (event.creator.toString() !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Check ticket status
      if (ticket.status === TicketStatus.USED) {
        res.status(200).json({
          success: true,
          message: 'Ticket already used',
          data: ticket
        });
        return;
      }

      if (ticket.status !== TicketStatus.PAID) {
        res.status(400).json({
          success: false,
          message: 'Ticket payment not confirmed'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Ticket verified',
        data: ticket
      });
    } catch (error: any) {
      Logger.error('Verify ticket for event error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify ticket'
      });
    }
  }

  /**
   * Mark ticket as used directly
   */
  static async markTicketAsUsed(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const ticket = await Ticket.findById(id).populate('event');

      if (!ticket) {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }

      const event: any = ticket.event;

      // Check if the current user is the event creator
      if (event.creator.toString() !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: 'Unauthorized: You are not the event creator'
        });
        return;
      }

      // Mark as used
      ticket.status = TicketStatus.USED;
      ticket.scannedAt = new Date();
      await ticket.save();

      res.status(200).json({
        success: true,
        message: 'Ticket marked as used',
        data: ticket
      });
    } catch (error: any) {
      Logger.error('Mark ticket as used error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark ticket as used'
      });
    }
  }
}

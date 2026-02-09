import { Ticket, ITicket } from '../models';
import QRCodeService from './QRCodeService';
import { v4 as uuidv4 } from 'uuid';

export class TicketService {
  private static response(status: string, message: string, ticket?: ITicket) {
    return { status, message, ...(ticket && { ticket }) };
  }

  static async generateTicket(eventId: string, buyerId: string, quantity: number, price: number): Promise<ITicket | null> {
    try {
      const ticketNumber = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
      const { qrCode, qrImage } = await QRCodeService.generateTicketQR(ticketNumber, eventId, buyerId);
      return await Ticket.create({ eventId, buyerId, ticketNumber, qrCode, qrCodeImage: qrImage, price, quantity });
    } catch (e) {
      console.error('Generate ticket error:', e);
      return null;
    }
  }

  static async getTicketByNumber(ticketNumber: string): Promise<ITicket | null> {
    try {
      return await Ticket.findOne({ ticketNumber }).populate('eventId').populate('buyerId', 'firstName lastName email');
    } catch (e) {
      console.error('Fetch ticket error:', e);
      return null;
    }
  }

  static async getUserTickets(userId: string): Promise<ITicket[]> {
    try {
      return await Ticket.find({ buyerId: userId }).populate('eventId').sort({ purchaseDate: -1 });
    } catch (e) {
      console.error('Fetch user tickets error:', e);
      return [];
    }
  }

  static async validateQRCode(qrCode: string): Promise<boolean> {
    try {
      return QRCodeService.verifyQRCode(qrCode);
    } catch (e) {
      console.error('Validate QR error:', e);
      return false;
    }
  }

  static async scanQRCode(ticketNumber: string): Promise<any> {
    try {
      const ticket = await Ticket.findOne({ ticketNumber });
      if (!ticket) return this.response('error', 'Ticket not found');
      if (ticket.status === 'used') return this.response('error', 'Ticket already used');
      if (ticket.status === 'cancelled') return this.response('error', 'Ticket has been cancelled');

      ticket.status = 'used';
      ticket.usedAt = new Date();
      await ticket.save();
      return this.response('success', 'QR code verified successfully', ticket);
    } catch (e) {
      console.error('Scan QR error:', e);
      return this.response('error', 'Error scanning QR code');
    }
  }

  static async refundTicket(ticketNumber: string): Promise<boolean> {
    try {
      const result = await Ticket.findOneAndUpdate({ ticketNumber }, { status: 'refunded' });
      return !!result;
    } catch (e) {
      console.error('Refund ticket error:', e);
      return false;
    }
  }

  static async getEventTickets(eventId: string): Promise<ITicket[]> {
    try {
      return await Ticket.find({ eventId }).populate('buyerId', 'firstName lastName email');
    } catch (e) {
      console.error('Fetch event tickets error:', e);
      return [];
    }
  }

  static async getEventTicketStats(eventId: string): Promise<any> {
    try {
      const [totalSold, totalUsed, totalRefunded] = await Promise.all([
        Ticket.countDocuments({ eventId, status: 'valid' }),
        Ticket.countDocuments({ eventId, status: 'used' }),
        Ticket.countDocuments({ eventId, status: 'refunded' }),
      ]);
      return { totalSold, totalUsed, totalRefunded, usageRate: totalSold > 0 ? (totalUsed / totalSold) * 100 : 0 };
    } catch (e) {
      console.error('Fetch stats error:', e);
      return null;
    }
  }
}

export default TicketService;

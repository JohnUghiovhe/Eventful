import mongoose, { Schema } from 'mongoose';
import { ITicket, TicketStatus, ReminderPeriod } from '../types';

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true
    },
    event: {
      type: String,
      ref: 'Event',
      required: true
    },
    user: {
      type: String,
      ref: 'User',
      required: true
    },
    qrCode: {
      type: String,
      required: true
    },
    qrCodeData: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.PENDING
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    scannedAt: {
      type: Date
    },
    reminder: {
      type: String,
      enum: Object.values(ReminderPeriod),
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    payment: {
      type: String,
      ref: 'Payment',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
ticketSchema.index({ event: 1, user: 1 });
ticketSchema.index({ status: 1 });

const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);

export default Ticket;
export type { ITicket };

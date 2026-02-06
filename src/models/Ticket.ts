import { Schema, Document, Model, model, Types } from 'mongoose';

export interface ITicket extends Document {
  eventId: Types.ObjectId;
  buyerId: Types.ObjectId;
  ticketNumber: string;
  status: 'valid' | 'used' | 'cancelled' | 'refunded';
  qrCode: string;
  qrCodeImage?: string;
  purchaseDate: Date;
  usedAt?: Date;
  price: number;
  quantity: number;
  reminderSettings?: {
    remindAt?: Array<{
      type: 'email' | 'sms';
      timeBefore: number; // in hours
      sent: boolean;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required'],
    },
    ticketNumber: {
      type: String,
      required: [true, 'Ticket number is required'],
      unique: true,
    },
    status: {
      type: String,
      enum: ['valid', 'used', 'cancelled', 'refunded'],
      default: 'valid',
    },
    qrCode: {
      type: String,
      required: [true, 'QR code is required'],
    },
    qrCodeImage: String,
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    usedAt: Date,
    price: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Ticket quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    reminderSettings: {
      remindAt: [
        {
          type: {
            type: String,
            enum: ['email', 'sms'],
          },
          timeBefore: Number, // in hours
          sent: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ticketSchema.index({ buyerId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ qrCode: 1 });
ticketSchema.index({ purchaseDate: 1 });
ticketSchema.index({ eventId: 1, status: 1 }); // Compound index

export const Ticket: Model<ITicket> = model<ITicket>('Ticket', ticketSchema);

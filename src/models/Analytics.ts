import { Schema, Document, model, Types } from 'mongoose';

export interface IAnalytics extends Document {
  eventId: Types.ObjectId;
  creatorId: Types.ObjectId;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendees: number;
  totalQRScans: number;
  totalRefunds: number;
  refundAmount: number;
  conversionRate: number; // percentage of viewers who purchased
  averageTicketsPerBuyer: number;
  dailyStats: Array<{
    date: Date;
    ticketsSold: number;
    revenue: number;
    newAttendees: number;
    qrScans: number;
  }>;
  paymentMethodBreakdown: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  geographicData?: Array<{
    location: string;
    attendeeCount: number;
    revenue: number;
  }>;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const analyticsSchema = new Schema<IAnalytics>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      unique: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    totalTicketsSold: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAttendees: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQRScans: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRefunds: {
      type: Number,
      default: 0,
      min: 0,
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    averageTicketsPerBuyer: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyStats: [
      {
        date: Date,
        ticketsSold: Number,
        revenue: Number,
        newAttendees: Number,
        qrScans: Number,
      },
    ],
    paymentMethodBreakdown: [
      {
        method: String,
        count: Number,
        amount: Number,
      },
    ],
    geographicData: [
      {
        location: String,
        attendeeCount: Number,
        revenue: Number,
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (eventId already has unique: true)\nanalyticsSchema.index({ creatorId: 1 });
analyticsSchema.index({ lastUpdated: 1 });

const Analytics = model<IAnalytics>('Analytics', analyticsSchema);

export default Analytics;

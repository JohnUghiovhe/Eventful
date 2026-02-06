import { Schema, Document, Model, model, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  type: 'reminder' | 'status_update' | 'payment_confirmation' | 'ticket_confirmation' | 'cancellation';
  title: string;
  message: string;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
  notificationChannels: Array<{
    channel: 'email' | 'sms' | 'in_app';
    status: 'pending' | 'sent' | 'failed';
    sentAt?: Date;
    error?: string;
  }>;
  scheduledFor?: Date;
  reminderSettings?: {
    timeBefore: number; // in hours
    repeat: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    type: {
      type: String,
      enum: ['reminder', 'status_update', 'payment_confirmation', 'ticket_confirmation', 'cancellation'],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    readAt: Date,
    notificationChannels: [
      {
        channel: {
          type: String,
          enum: ['email', 'sms', 'in_app'],
        },
        status: {
          type: String,
          enum: ['pending', 'sent', 'failed'],
          default: 'pending',
        },
        sentAt: Date,
        error: String,
      },
    ],
    scheduledFor: Date,
    reminderSettings: {
      timeBefore: Number, // in hours
      repeat: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ eventId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ sentAt: 1 });
notificationSchema.index({ scheduledFor: 1 });

export const Notification: Model<INotification> = model<INotification>(
  'Notification',
  notificationSchema
);

import mongoose, { Schema } from 'mongoose';
import { IEvent, EventStatus, ReminderPeriod } from '../types';

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    creator: {
      type: String,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    venue: {
      type: String,
      required: true
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    ticketPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalTickets: {
      type: Number,
      required: true,
      min: 1
    },
    availableTickets: {
      type: Number,
      required: true,
      min: 0
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: Object.values(EventStatus),
      default: EventStatus.DRAFT
    },
    defaultReminder: {
      type: String,
      enum: Object.values(ReminderPeriod),
      default: ReminderPeriod.ONE_DAY
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
eventSchema.index({ creator: 1, status: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ tags: 1 });

const Event = mongoose.model<IEvent>('Event', eventSchema);

export default Event;
export type { IEvent };

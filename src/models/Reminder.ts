import mongoose, { Schema } from 'mongoose';
import { IReminder } from '../types';

const reminderSchema = new Schema<IReminder>(
  {
    user: {
      type: String,
      ref: 'User',
      required: true
    },
    event: {
      type: String,
      ref: 'Event',
      required: true
    },
    ticket: {
      type: String,
      ref: 'Ticket',
      required: true
    },
    scheduledFor: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
reminderSchema.index({ scheduledFor: 1, sent: 1 });
reminderSchema.index({ user: 1, event: 1 });

const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema);

export default Reminder;

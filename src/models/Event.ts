import { Schema, Document, Model, model, Types } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  creator: Types.ObjectId;
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
  ticketsAvailable: number;
  ticketPrice: number;
  category: string;
  tags: string[];
  image?: string;
  banner?: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  isFeatured: boolean;
  reminderSettings: {
    creatorReminders: Array<{
      type: 'email' | 'sms';
      timeBefore: number; // in hours
      sent: boolean;
    }>;
  };
  socialShareLinks?: {
    shortUrl: string;
    facebookUrl?: string;
    twitterUrl?: string;
    whatsappUrl?: string;
    linkedinUrl?: string;
  };
  attendeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required'],
    },
    eventType: {
      type: String,
      enum: ['concert', 'theater', 'sports', 'conference', 'meetup', 'workshop', 'festival', 'other'],
      required: [true, 'Event type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function (value: Date) {
          return value > new Date();
        },
        message: 'Start date must be in the future',
      },
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (this: any, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
      },
      latitude: Number,
      longitude: Number,
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    ticketsAvailable: {
      type: Number,
      required: [true, 'Available tickets count is required'],
      min: [0, 'Available tickets cannot be negative'],
    },
    ticketPrice: {
      type: Number,
      required: [true, 'Ticket price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['music', 'sports', 'entertainment', 'education', 'business', 'other'],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    image: String,
    banner: String,
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reminderSettings: {
      creatorReminders: [
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
    socialShareLinks: {
      shortUrl: String,
      facebookUrl: String,
      twitterUrl: String,
      whatsappUrl: String,
      linkedinUrl: String,
    },
    attendeeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
eventSchema.index({ creator: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ isFeatured: 1 });

export const Event: Model<IEvent> = model<IEvent>('Event', eventSchema);

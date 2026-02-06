import { Schema, Document, Model, model, Types } from 'mongoose';

export interface IPayment extends Document {
  payerId: Types.ObjectId;
  eventId: Types.ObjectId;
  ticketId: Types.ObjectId;
  amount: number;
  currency: string;
  paymentMethod: 'paystack' | 'card' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paystackReference?: string;
  paystackAuthorizationUrl?: string;
  transactionId: string;
  description: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    payerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payer ID is required'],
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: 'Ticket',
      required: [true, 'Ticket ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'NGN',
      enum: ['NGN', 'USD', 'EUR', 'GBP'],
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'card', 'bank_transfer'],
      default: 'paystack',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paystackReference: String,
    paystackAuthorizationUrl: String,
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Payment description is required'],
    },
    paidAt: Date,
    refundedAt: Date,
    refundReason: String,
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes (transactionId already has unique: true)
paymentSchema.index({ payerId: 1 });
paymentSchema.index({ eventId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paystackReference: 1 });
paymentSchema.index({ createdAt: 1 });

export const Payment: Model<IPayment> = model<IPayment>('Payment', paymentSchema);

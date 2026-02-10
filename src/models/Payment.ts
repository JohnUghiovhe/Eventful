import mongoose, { Schema } from 'mongoose';
import { IPayment, PaymentStatus } from '../types';

const paymentSchema = new Schema<IPayment>(
  {
    reference: {
      type: String,
      required: true
    },
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
      ref: 'Ticket'
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'NGN'
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    paystackReference: {
      type: String,
      required: true
    },
    paystackAuthorizationUrl: {
      type: String
    },
    paystackResponse: {
      type: Schema.Types.Mixed,
      default: null
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null
    },
    refundedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes with proper configuration
// Reference must be unique (no duplicate payments for same txn)
paymentSchema.index({ reference: 1 }, { unique: true });
// Composite index for querying user payments for specific event
paymentSchema.index({ user: 1, event: 1 });
// Index for status queries
paymentSchema.index({ status: 1 });
// Index for payment verification by paystackReference
paymentSchema.index({ paystackReference: 1 }, { sparse: true });
// Add expire index for pending payments after 24 hours
paymentSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 86400,
    partialFilterExpression: { status: PaymentStatus.PENDING }
  }
);

const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

export default Payment;
export type { IPayment };

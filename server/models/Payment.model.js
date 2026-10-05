const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'ENTERPRISE'],
      required: true,
    },
    amount: {
      type: Number,
      required: true, // Amount in paise
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    rawWebhookData: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Composite indexes for faster queries
paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

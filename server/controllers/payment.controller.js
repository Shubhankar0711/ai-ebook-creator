const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User.model');
const Payment = require('../models/Payment.model');

// Production Plan Prices in Paise (1 INR = 100 Paise)
// Server is the single source of truth for pricing.
const PLAN_PRICES = {
  PRO: 49900,         // ₹499
  ENTERPRISE: 149900, // ₹1,499
};

const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId.includes('PASTE') || keySecret.includes('PASTE')) {
    return null;
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// @desc GET available plans & prices (Public)
// @route GET /api/payments/plans
const getPlans = (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      amount: 0,
      currency: 'INR',
      features: ['5 eBooks max', '10 AI generations/day', 'Max 5 chapters/book', 'PDF Export'],
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      amount: PLAN_PRICES.PRO,
      currency: 'INR',
      features: [
        'Unlimited eBooks',
        'Unlimited AI generations',
        'Unlimited chapters',
        'Full AI Suite (Outline, Rewrite, Expand, Summarize)',
        'DOCX & PDF Export',
        'Advanced Analytics',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      amount: PLAN_PRICES.ENTERPRISE,
      currency: 'INR',
      features: [
        'Everything in Pro',
        'Team Workspace',
        'Role-based access (Admin/Editor)',
        'Shared Books',
        'Dedicated Support',
      ],
    },
  ];

  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated';
  res.json({ success: true, plans, keyId });
};

// @desc Create Razorpay Payment Order (Protected)
// @route POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { planId, plan: requestedPlan } = req.body;
    const rawPlan = (planId || requestedPlan || '').toString().toUpperCase();

    if (!PLAN_PRICES[rawPlan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan selected. Must be PRO or ENTERPRISE.',
      });
    }

    const amount = PLAN_PRICES[rawPlan];
    const currency = 'INR';
    const razorpay = getRazorpayInstance();

    let razorpayOrder;

    if (razorpay) {
      razorpayOrder = await razorpay.orders.create({
        amount,
        currency,
        receipt: `rcpt_${req.user._id}_${Date.now()}`,
        notes: {
          userId: req.user._id.toString(),
          plan: rawPlan,
        },
      });
    } else {
      // Test Mode Simulation Order
      const simOrderId = `order_sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      razorpayOrder = {
        id: simOrderId,
        entity: 'order',
        amount,
        amount_paid: 0,
        amount_due: amount,
        currency,
        receipt: `rcpt_${req.user._id}_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: { userId: req.user._id.toString(), plan: rawPlan },
        created_at: Math.floor(Date.now() / 1000),
        isSimulated: true,
      };
    }

    // Record PENDING payment record in MongoDB
    await Payment.create({
      user: req.user._id,
      plan: rawPlan,
      amount,
      currency,
      razorpayOrderId: razorpayOrder.id,
      status: 'PENDING',
    });

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_simulated';

    res.status(201).json({
      success: true,
      order: razorpayOrder,
      keyId,
      amount,
      currency,
      plan: rawPlan,
    });
  } catch (error) {
    console.error('Create Payment Order Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment order',
    });
  }
};

// @desc Verify Razorpay Payment Signature (Protected)
// @route POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      plan: requestedPlan,
    } = req.body;

    const rawPlan = (planId || requestedPlan || '').toString().toUpperCase();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing order_id or payment_id for verification.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    const isSimulatedOrder = razorpay_order_id.startsWith('order_sim_');

    if (isProduction && isSimulatedOrder) {
      return res.status(403).json({
        success: false,
        message: 'Simulated payment orders are strictly prohibited in production mode.',
      });
    }

    let isValidSignature = false;

    if (keySecret && !keySecret.includes('PASTE')) {
      // HMAC-SHA256 verification
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isValidSignature = (generatedSignature === razorpay_signature);
    } else if (!isProduction && isSimulatedOrder) {
      // Test / development environment simulated signature check
      isValidSignature = Boolean(razorpay_signature && razorpay_signature.length > 5);
    }

    // STRICT SECURITY RULE: Invalid signature MUST result in 403 and NO subscription upgrade
    if (!isValidSignature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'FAILED', razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature }
      );

      return res.status(403).json({
        success: false,
        message: '403 Payment verification failed: Invalid HMAC signature.',
      });
    }

    const selectedPlan = PLAN_PRICES[rawPlan] ? rawPlan : 'PRO';
    const amount = PLAN_PRICES[selectedPlan];

    // Find existing pending payment record or create successful payment entry
    let paymentDoc = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!paymentDoc) {
      paymentDoc = new Payment({
        user: req.user._id,
        plan: selectedPlan,
        amount,
        currency: 'INR',
        razorpayOrderId: razorpay_order_id,
      });
    }

    paymentDoc.razorpayPaymentId = razorpay_payment_id;
    paymentDoc.razorpaySignature = razorpay_signature;
    paymentDoc.status = 'SUCCESS';
    await paymentDoc.save();

    // Activate User Subscription (30 days validity)
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscriptionPlan: selectedPlan,
        plan: selectedPlan.toLowerCase(),
        subscriptionStatus: 'active',
        subscriptionStart: startDate,
        subscriptionEnd: endDate,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: `🎉 Payment verified! Upgraded to ${selectedPlan} plan.`,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        subscriptionPlan: updatedUser.subscriptionPlan,
        plan: updatedUser.plan,
        subscriptionStatus: updatedUser.subscriptionStatus,
        subscriptionStart: updatedUser.subscriptionStart,
        subscriptionEnd: updatedUser.subscriptionEnd,
      },
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
};

// @desc Get Payment History for User (Protected)
// @route GET /api/payments/history
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort('-createdAt')
      .select('plan amount currency razorpayOrderId razorpayPaymentId status createdAt');

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Downgrade/Cancel Plan to Free (Protected)
// @route POST /api/payments/cancel
const cancelPlan = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscriptionPlan: 'FREE',
        plan: 'free',
        subscriptionStatus: 'active',
        subscriptionEnd: null,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Plan cancelled. You are now on the Free plan.',
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Handle Razorpay Webhooks (Public Webhook Endpoint)
// @route POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(req.body);
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.event;

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity) {
        const orderId = paymentEntity.order_id;
        const paymentId = paymentEntity.id;
        const userId = paymentEntity.notes?.userId;
        const plan = (paymentEntity.notes?.plan || 'PRO').toUpperCase();

        const paymentDoc = await Payment.findOne({ razorpayOrderId: orderId });
        if (paymentDoc && paymentDoc.status === 'SUCCESS') {
          // Idempotent: already processed
          return res.json({ status: 'ok', message: 'Already processed' });
        }

        if (paymentDoc) {
          paymentDoc.status = 'SUCCESS';
          paymentDoc.razorpayPaymentId = paymentId;
          await paymentDoc.save();
        }

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            subscriptionPlan: plan,
            plan: plan.toLowerCase(),
            subscriptionStatus: 'active',
            subscriptionStart: new Date(),
            subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          { status: 'FAILED', razorpayPaymentId: paymentEntity.id }
        );
      }
    } else if (event === 'refund.created') {
      const refundEntity = payload.payload?.refund?.entity;
      if (refundEntity?.payment_id) {
        const p = await Payment.findOneAndUpdate(
          { razorpayPaymentId: refundEntity.payment_id },
          { status: 'REFUNDED' },
          { new: true }
        );
        if (p?.user) {
          await User.findByIdAndUpdate(p.user, {
            subscriptionPlan: 'FREE',
            plan: 'free',
            subscriptionStatus: 'cancelled',
          });
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlans,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  cancelPlan,
  handleWebhook,
};

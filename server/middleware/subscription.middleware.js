const User = require('../models/User.model');

// Helper to check and handle subscription expiration
const checkSubscriptionExpiration = async (user) => {
  if (!user || user.subscriptionPlan === 'FREE') return user;

  if (user.subscriptionEnd && new Date(user.subscriptionEnd) < new Date()) {
    user.subscriptionPlan = 'FREE';
    user.plan = 'free';
    user.subscriptionStatus = 'expired';
    await user.save();
  }
  return user;
};

const requireFree = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized, no user session' });
  }
  next();
};

const requirePro = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = await checkSubscriptionExpiration(req.user);

    const plan = req.user.subscriptionPlan || 'FREE';
    const status = req.user.subscriptionStatus || 'active';

    if (status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your subscription is inactive or expired. Please upgrade to Pro.',
        limitReached: true,
      });
    }

    if (plan !== 'PRO' && plan !== 'ENTERPRISE') {
      return res.status(403).json({
        success: false,
        message: 'Pro or Enterprise plan required to access this premium feature.',
        limitReached: true,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requireEnterprise = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = await checkSubscriptionExpiration(req.user);

    const plan = req.user.subscriptionPlan || 'FREE';
    const status = req.user.subscriptionStatus || 'active';

    if (status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your subscription is inactive or expired. Please upgrade.',
        limitReached: true,
      });
    }

    if (plan !== 'ENTERPRISE') {
      return res.status(403).json({
        success: false,
        message: 'Enterprise plan required to access this team workspace feature.',
        limitReached: true,
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const limitAiUsage = async (req, res, next) => {
  try {
    let user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user = await checkSubscriptionExpiration(user);

    const plan = user.subscriptionPlan || 'FREE';

    if (plan === 'FREE') {
      const todayStr = new Date().toDateString();
      const lastUsageStr = user.lastAiUsageDate
        ? new Date(user.lastAiUsageDate).toDateString()
        : '';

      let usageToday = user.aiUsageToday || 0;
      if (todayStr !== lastUsageStr) {
        usageToday = 0;
        user.aiUsageToday = 0;
        user.lastAiUsageDate = new Date();
      }

      if (usageToday >= 10) {
        return res.status(403).json({
          success: false,
          message: 'Daily AI generation limit reached (10/day for Free users). Upgrade to Pro for unlimited AI generations!',
          limitReached: true,
        });
      }

      user.aiUsageToday = usageToday + 1;
      user.aiCreditsUsed = (user.aiCreditsUsed || 0) + 1;
      await user.save();
      req.user = user;
    } else {
      user.aiCreditsUsed = (user.aiCreditsUsed || 0) + 1;
      await user.save();
      req.user = user;
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin authorization required' });
  }
  next();
};

module.exports = {
  requireFree,
  requirePro,
  requireEnterprise,
  limitAiUsage,
  isAdmin,
  checkSubscriptionExpiration,
};

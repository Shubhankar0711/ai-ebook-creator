const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    // Primary subscription plan field
    subscriptionPlan: {
      type: String,
      enum: ['FREE', 'PRO', 'ENTERPRISE'],
      default: 'FREE',
      index: true,
    },
    // Maintained for backward compatibility with frontend user.plan
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
    subscriptionStart: {
      type: Date,
      default: Date.now,
    },
    subscriptionEnd: {
      type: Date,
    },
    aiCreditsUsed: {
      type: Number,
      default: 0,
    },
    aiUsageToday: {
      type: Number,
      default: 0,
    },
    lastAiUsageDate: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    booksCreated: {
      type: Number,
      default: 0,
    },
    favoriteBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
    recentActivity: [
      {
        action: String,
        bookTitle: String,
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    preferences: {
      darkMode: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      defaultTone: { type: String, default: 'professional' },
    },
  },
  { timestamps: true }
);

// Keep plan and subscriptionPlan synchronized, hash password on save
userSchema.pre('save', async function (next) {
  if (this.isModified('subscriptionPlan') && this.subscriptionPlan) {
    this.plan = this.subscriptionPlan.toLowerCase();
  } else if (this.isModified('plan') && this.plan) {
    this.subscriptionPlan = this.plan.toUpperCase();
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

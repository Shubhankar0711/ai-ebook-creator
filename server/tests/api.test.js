const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User.model');
const Book = require('../models/Book.model');
const Payment = require('../models/Payment.model');

describe('AI eBook Creator API Integration Tests', () => {
  let userToken;
  let userId;
  let bookId;

  const testUser = {
    name: 'Test Placement User',
    email: `test_user_${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    // Connect to in-memory/test database or test MONGODB_URI
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ebook_creator_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    if (userId) {
      await User.findByIdAndDelete(userId);
      await Book.deleteMany({ owner: userId });
      await Payment.deleteMany({ user: userId });
    }
    await mongoose.connection.close();
  });

  describe('1. Authentication Flow', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      userToken = res.body.token;
      userId = res.body.user._id;
    });

    it('should login with registered credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject invalid password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request to protected route', async () => {
      const res = await request(app).get('/api/books');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('2. Resource Ownership & Book Operations', () => {
    it('should create a new book for authenticated user', async () => {
      const res = await request(app)
        .post('/api/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Placement Test Book',
          genre: 'technology',
          numberOfChapters: 3,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.book._id).toBeDefined();
      bookId = res.body.book._id;
    });

    it('should retrieve user books list', async () => {
      const res = await request(app)
        .get('/api/books')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.books)).toBe(true);
      expect(res.body.books.length).toBeGreaterThan(0);
    });

    it('should reject unauthorized user attempting to access another user book', async () => {
      const fakeObjectId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/books/${fakeObjectId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Payment Gateway & Razorpay Security', () => {
    let orderId;

    it('should create payment order with backend server price', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ planId: 'pro' });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toBeDefined();
      expect(res.body.amount).toEqual(49900); // Server source of truth price ₹499 in paise
      orderId = res.body.order.id;
    });

    it('STRICT SECURITY: should return 403 Payment Verification Failed on invalid signature', async () => {
      const res = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          razorpay_order_id: 'order_live_12345',
          razorpay_payment_id: 'pay_live_12345',
          razorpay_signature: 'invalid_forged_signature',
          planId: 'pro',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Payment verification failed');

      // Verify user subscription was NOT upgraded
      const user = await User.findById(userId);
      expect(user.subscriptionPlan).not.toEqual('PRO');
    });

    it('should return user payment history', async () => {
      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.payments)).toBe(true);
    });
  });

  describe('4. Admin Authorization Security', () => {
    it('should reject non-admin user from accessing admin dashboard route', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });
  });
});

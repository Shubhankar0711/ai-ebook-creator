# 📚 AI-Powered eBook Creator (Production SaaS Platform)

An end-to-end full-stack MERN application for generating, writing, editing, and exporting professional eBooks with Groq AI acceleration, Razorpay payment processing, and subscription authorization controls.

---

## 🌟 Project Overview

The **AI-Powered eBook Creator** allows authors, educators, and content creators to go from concept to completed eBook in minutes. Key capabilities include:

- **AI-Assisted Writing & Generation**: Auto-generate full book outlines, chapter drafts, titles, summaries, expansions, rewrites, and grammar improvements powered by Groq Llama-3.
- **Production Payment Security**: Integrated Razorpay Checkout with strict server-side price validation, HMAC SHA256 signature verification, and 403 authorization protection.
- **Tiered Subscription System**: Granular feature enforcement across **Free**, **Pro**, and **Enterprise** tiers with auto-expiration tracking and daily usage limits.
- **Multi-Format Document Export**: Professional export to PDF, Plain Text (TXT), and genuine Microsoft Word OpenXML (`.docx`) using native document compilation.
- **Resource Ownership Security**: Multi-tenant authorization ensuring users can only read, edit, or delete their own books, chapters, analytics, and favorites.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Design System
- **State & Context**: AuthContext, SubscriptionContext, ThemeContext
- **Icons & Animation**: Lucide React + Framer Motion
- **HTTP Client**: Axios (with JWT interceptors)

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose (Indexes & Validation)
- **Security**: Helmet, CORS, Express Rate Limit, bcryptjs
- **Authentication**: JSON Web Tokens (JWT)
- **AI Integration**: Groq SDK (`llama-3.3-70b-versatile`)
- **Payment Processing**: Razorpay Node SDK + HMAC Crypto Verification
- **Document Generators**: `pdf-lib` + `docx`

---

## 📐 Architecture & System Flows

### 1. Deployment Architecture
```text
User Browser (React + Vite on Vercel)
         │
         │ HTTPS / REST API
         ▼
Backend API (Express + Node.js on Render)
   ├── MongoDB Atlas (Users, Books, Chapters, Payments)
   ├── Groq AI API (LLM Generation)
   └── Razorpay (Test / Production Checkout & Webhooks)
```

### 2. Payment Security Flow
```text
User selects Pro/Enterprise Plan
  └──> Frontend requests /api/payments/create-order
        └──> Backend validates plan & looks up server price (PLAN_PRICES)
              └──> Creates Razorpay Order & records PENDING Payment doc
                    └──> Razorpay Checkout Modal opens in Browser
                          └──> User completes transaction
                                └──> Frontend sends order_id, payment_id, signature to /api/payments/verify
                                      └──> Backend verifies HMAC SHA256 signature
                                            ├── MATCH: Mark Payment SUCCESS -> Activate PRO Subscription (30 days)
                                            └── MISMATCH: Mark Payment FAILED -> Return 403 Forbidden
```

---

## 🔒 Security Rules Enforced

1. **HMAC Signature Verification**: Invalid or missing Razorpay signatures strictly return `403 Payment verification failed`. No user is upgraded on invalid signature.
2. **Server-Side Pricing**: Prices (`PRO`: ₹499 / 49900 paise, `ENTERPRISE`: ₹1,499 / 149900 paise) are defined on the backend. Frontend `amount` payloads are ignored.
3. **Resource Ownership Checks**: Every book/chapter/AI/export query validates `{ _id: resourceId, owner: req.user._id }`.
4. **Environment Isolation**: API keys (`GROQ_API_KEY`, `RAZORPAY_KEY_SECRET`, `JWT_SECRET`, `MONGODB_URI`) are strictly server-side.

---

## 💎 Feature Matrix by Plan

| Feature | FREE | PRO | ENTERPRISE |
| :--- | :---: | :---: | :---: |
| Maximum Books | 5 | Unlimited | Unlimited |
| AI Prompt Limit | 10 per day | Unlimited | Unlimited |
| Max Chapters per Book | 5 | Unlimited | Unlimited |
| AI Title & Basic Chapter Gen | ✅ | ✅ | ✅ |
| AI Outline & Rewrite Suite | ❌ | ✅ | ✅ |
| PDF Export | ✅ | ✅ | ✅ |
| DOCX Export (Real Word) | ❌ | ✅ | ✅ |
| Team Workspace | ❌ | ❌ | ✅ |
| Payment History Dashboard | ✅ | ✅ | ✅ |

---

## 🚀 Local Setup & Installation Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URI)
- Groq API Key (Free key from [groq.com](https://console.groq.com))
- Razorpay Account (Test mode keys from [razorpay.com](https://dashboard.razorpay.com))

### 1. Clone & Install Dependencies
```bash
# Clone repository
git clone https://github.com/your-repo/ebook-creator.git
cd ebook-creator

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

### 2. Environment Variables Configuration

Create `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ebook-creator
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
GROQ_API_KEY=gsk_your_groq_api_key_here
AI_PROVIDER=groq
NODE_ENV=development
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Run Application Locally

Start backend server:
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

Start frontend client:
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

---

## 🧪 Running Automated Tests

Backend integration tests cover Authentication, Resource Ownership Security, Razorpay HMAC 403 Rejection, Daily AI Limits, and Payment History.

Run test suite:
```bash
cd server
npm test
```

---

## 🌐 Deployment Instructions

### Backend (Render)
1. Create a Web Service on Render pointing to the `/server` directory.
2. Build Command: `npm install`
3. Start Command: `node index.js`
4. Set Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_URL`).

### Frontend (Vercel)
1. Deploy the `/client` directory on Vercel.
2. Set Environment Variable `VITE_API_URL` to your Render backend URL (`https://your-backend.onrender.com/api`).

---

## 🎯 Placement Interview Questions & Answers

### Q1: How did you ensure payment verification security in Razorpay?
> **Answer**: In Razorpay, client-side callbacks can be spoofed or intercepted. To make payments production-grade, order creation is handled on the Express backend where price is determined from a server-side dictionary (`PLAN_PRICES`). When the payment completes, the frontend sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/payments/verify`. The backend computes HMAC-SHA256 of `order_id|payment_id` using `RAZORPAY_KEY_SECRET`. If signatures match, the payment record status is updated to `SUCCESS` and subscription activated. If signatures mismatch, the server returns `403 Payment verification failed` and rejects subscription upgrades.

### Q2: How is multi-tenant resource ownership enforced?
> **Answer**: We enforce strict MongoDB query isolation in controllers. Instead of calling `Book.findById(id)`, every database operation enforces `{ _id: id, owner: req.user._id }`. This prevents Horizontal Privilege Escalation (IDOR), ensuring users cannot access or tamper with other users' books, chapters, analytics, or export files.

### Q3: How are daily AI rate limits enforced without race conditions?
> **Answer**: The backend `limitAiUsage` middleware inspects the user's `lastAiUsageDate` against the current date string. If a new day has started, `aiUsageToday` resets to 0. For Free users, if `aiUsageToday >= 10`, the request is rejected with `403 Limit Reached`. We use atomic MongoDB `$inc` updates to prevent concurrent request race conditions.

# AI eBook Creator — REST API Documentation

This API provides endpoints for user authentication, AI-powered book generation, eBook/chapter management, Razorpay payment processing, and subscription authorization.

---

## Base URL
```text
Development: http://localhost:5000/api
Production:  https://your-backend.onrender.com/api
```

---

## Authentication Standard

Protected endpoints require a JSON Web Token (JWT) provided in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication APIs

### Register User
- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Jane Author",
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "token": "eyJhbGciOi...",
    "user": {
      "_id": "66bc0f1e...",
      "name": "Jane Author",
      "email": "jane@example.com",
      "subscriptionPlan": "FREE",
      "role": "user"
    }
  }
  ```

### Login User
- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { ... }
  }
  ```

---

## 2. eBook Management APIs

### Get All User eBooks
- **Method:** `GET`
- **Endpoint:** `/books`
- **Auth Required:** Yes
- **Query Parameters:** `page=1`, `limit=10`, `search=ai`, `genre=technology`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "books": [...],
    "pagination": { "total": 1, "page": 1, "pages": 1, "limit": 10 }
  }
  ```

### Create eBook
- **Method:** `POST`
- **Endpoint:** `/books`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "title": "Mastering Full Stack AI",
    "genre": "technology",
    "language": "English",
    "numberOfChapters": 5
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "book": { "_id": "...", "title": "Mastering Full Stack AI", "owner": "..." }
  }
  ```

---

## 3. AI Generation APIs (Groq Powered)

### Generate Book Outline
- **Method:** `POST`
- **Endpoint:** `/ai/generate-outline`
- **Auth Required:** Yes (Pro / Enterprise required)
- **Request Body:**
  ```json
  {
    "title": "Mastering Full Stack AI",
    "genre": "technology",
    "numberOfChapters": 10
  }
  ```

### Generate Chapter Content
- **Method:** `POST`
- **Endpoint:** `/ai/generate-chapter`
- **Auth Required:** Yes (Available on Free with daily 10 prompts limit)

---

## 4. Payment Gateway & Razorpay APIs

### Get Subscription Plans
- **Method:** `GET`
- **Endpoint:** `/payments/plans`
- **Auth Required:** No

### Create Razorpay Payment Order
- **Method:** `POST`
- **Endpoint:** `/payments/create-order`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  { "planId": "pro" }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "order": { "id": "order_xyz123", "amount": 49900, "currency": "INR" },
    "keyId": "rzp_test_...",
    "amount": 49900
  }
  ```

### Verify Razorpay Payment Signature
- **Method:** `POST`
- **Endpoint:** `/payments/verify`
- **Auth Required:** Yes
- **Request Body:**
  ```json
  {
    "razorpay_order_id": "order_xyz123",
    "razorpay_payment_id": "pay_abc789",
    "razorpay_signature": "e6a4b...",
    "planId": "pro"
  }
  ```
- **Response (200 OK / 403 Forbidden):**
  - **Success:** Upgrades subscription plan to `PRO`.
  - **403 Failure:** Mismatched HMAC signature strictly returns `403 Payment verification failed`.

### Get Payment History
- **Method:** `GET`
- **Endpoint:** `/payments/history`
- **Auth Required:** Yes

---

## 5. Document Export APIs

- **PDF Export:** `POST /api/export/pdf/:bookId`
- **TXT Export:** `GET /api/export/txt/:bookId`
- **DOCX Export:** `POST /api/export/docx/:bookId` (Pro/Enterprise required, generates native `.docx` OpenXML files)

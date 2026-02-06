# Eventful API Documentation

## Overview
Eventful is a comprehensive ticketing and event management platform built with TypeScript, Express.js, MongoDB, and Redis.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses follow a standard format:
```json
{
  "status": "success|error",
  "message": "Description of the response",
  "data": {}
}
```

---

## Authentication Endpoints

### 1. User Registration
**POST** `/auth/signup`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string (min 6 chars)",
  "phone": "string",
  "role": "creator|eventee"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "phone": "string",
      "role": "creator|eventee"
    },
    "token": "string"
  }
}
```

### 2. User Login
**POST** `/auth/signin`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "User signed in successfully",
  "data": {
    "user": { /* user data */ },
    "token": "string"
  }
}
```

### 3. Get User Profile
**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": { /* user profile */ }
}
```

### 4. Update User Profile
**PATCH** `/auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "bio": "string",
  "profileImage": "string (URL)",
  "socialLinks": {
    "facebook": "string",
    "twitter": "string",
    "instagram": "string",
    "linkedin": "string"
  }
}
```

---

## Event Endpoints

### 1. Create Event (Creator Only)
**POST** `/events`

**Headers:** `Authorization: Bearer <creator-token>`

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "eventType": "concert|theater|sports|conference|meetup|workshop|festival|other",
  "startDate": "ISO-8601 date",
  "endDate": "ISO-8601 date",
  "location": {
    "address": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string",
    "latitude": "number (optional)",
    "longitude": "number (optional)"
  },
  "capacity": "number",
  "ticketPrice": "number",
  "category": "music|sports|entertainment|education|business|other",
  "tags": ["string"],
  "image": "string (URL, optional)",
  "banner": "string (URL, optional)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Event created successfully",
  "data": { /* event object */ }
}
```

### 2. Get All Events
**GET** `/events?limit=20&skip=0&category=music&city=Lagos&eventType=concert`

**Query Parameters:**
- `limit`: Number of events to return (default: 20)
- `skip`: Number of events to skip for pagination (default: 0)
- `category`: Filter by category
- `city`: Filter by city
- `eventType`: Filter by event type

**Response (200):**
```json
{
  "status": "success",
  "data": [ /* array of events */ ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "skip": "number"
  }
}
```

### 3. Get Single Event
**GET** `/events/:eventId`

**Response (200):**
```json
{
  "status": "success",
  "data": { /* event details */ }
}
```

### 4. Get Creator's Events
**GET** `/events/user/my-events`

**Headers:** `Authorization: Bearer <creator-token>`

**Response (200):**
```json
{
  "status": "success",
  "data": [ /* creator's events */ ]
}
```

### 5. Update Event (Creator Only)
**PATCH** `/events/:eventId`

**Headers:** `Authorization: Bearer <creator-token>`

**Request Body:** (same as create event, all fields optional)

### 6. Publish Event
**POST** `/events/:eventId/publish`

**Headers:** `Authorization: Bearer <creator-token>`

**Response (200):**
```json
{
  "status": "success",
  "message": "Event published successfully"
}
```

### 7. Cancel Event
**POST** `/events/:eventId/cancel`

**Headers:** `Authorization: Bearer <creator-token>`

### 8. Get Event Analytics
**GET** `/events/:eventId/analytics`

**Headers:** `Authorization: Bearer <creator-token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "totalTicketsSold": "number",
    "totalRevenue": "number",
    "totalAttendees": "number",
    "totalQRScans": "number",
    "conversionRate": "number",
    "dailyStats": [ /* array of daily stats */ ]
  }
}
```

### 9. Share Event
**GET** `/events/:eventId/share`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "shareLink": "string",
    "platforms": {
      "facebook": "string",
      "twitter": "string",
      "linkedin": "string",
      "whatsapp": "string"
    }
  }
}
```

---

## Ticket Endpoints

### 1. Get User Tickets
**GET** `/tickets`

**Headers:** `Authorization: Bearer <eventee-token>`

**Response (200):**
```json
{
  "status": "success",
  "data": [ /* array of user tickets */ ]
}
```

### 2. Get Ticket Details
**GET** `/tickets/:ticketNumber`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "_id": "string",
    "ticketNumber": "string",
    "qrCode": "string",
    "qrCodeImage": "string (data URL)",
    "status": "valid|used|cancelled|refunded",
    "price": "number",
    "purchaseDate": "ISO-8601 date",
    "usedAt": "ISO-8601 date (optional)"
  }
}
```

### 3. Scan QR Code (Creator Only)
**POST** `/tickets/:ticketNumber/scan`

**Headers:** `Authorization: Bearer <creator-token>`

**Response (200):**
```json
{
  "status": "success",
  "message": "QR code verified successfully",
  "ticket": { /* ticket details */ }
}
```

### 4. Get Event Tickets (Creator Only)
**GET** `/tickets/events/:eventId`

**Headers:** `Authorization: Bearer <creator-token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "tickets": [ /* array of tickets */ ],
    "stats": {
      "totalSold": "number",
      "totalUsed": "number",
      "totalRefunded": "number",
      "usageRate": "number"
    }
  }
}
```

---

## Payment Endpoints

### 1. Initialize Payment
**POST** `/payments/initialize`

**Headers:** `Authorization: Bearer <eventee-token>`

**Request Body:**
```json
{
  "email": "string",
  "amount": "number (in Naira)",
  "eventId": "string",
  "ticketId": "string"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Payment initialized successfully",
  "data": {
    "authorizationUrl": "string",
    "reference": "string"
  }
}
```

### 2. Verify Payment
**GET** `/payments/verify?reference=TXN-XXXXXXXX`

**Response (200):**
```json
{
  "status": "success",
  "message": "Payment verified successfully",
  "payment": { /* payment details */ }
}
```

### 3. Get User Payments
**GET** `/payments/user/my-payments`

**Headers:** `Authorization: Bearer <eventee-token>`

**Response (200):**
```json
{
  "status": "success",
  "data": [ /* array of user payments */ ]
}
```

### 4. Get Event Payments (Creator Only)
**GET** `/payments/events/:eventId`

**Headers:** `Authorization: Bearer <creator-token>`

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "payments": [ /* array of payments */ ],
    "stats": {
      "totalRevenue": "number",
      "totalPayments": "number",
      "averagePayment": "number"
    }
  }
}
```

### 5. Refund Payment
**POST** `/payments/:transactionId/refund`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "message": "Payment refunded successfully"
}
```

---

## Notification Endpoints

### 1. Create Notification
**POST** `/notifications`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "eventId": "string",
  "type": "reminder|status_update|payment_confirmation|ticket_confirmation|cancellation",
  "title": "string",
  "message": "string",
  "notificationChannels": ["email", "sms", "in_app"],
  "scheduledFor": "ISO-8601 date (optional)"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Notification created successfully",
  "data": { /* notification object */ }
}
```

### 2. Get User Notifications
**GET** `/notifications?limit=50`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit`: Number of notifications to return (default: 50)

**Response (200):**
```json
{
  "status": "success",
  "data": [ /* array of notifications */ ]
}
```

### 3. Mark Notification as Read
**PATCH** `/notifications/:notificationId/read`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "status": "success",
  "message": "Notification marked as read"
}
```

### 4. Mark All Notifications as Read
**PATCH** `/notifications/mark-all-read`

**Headers:** `Authorization: Bearer <token>`

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "No token provided"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Rate Limiting

- General rate limit: 100 requests per 15 seconds
- Auth endpoints: 5 attempts per 15 minutes

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time when limit resets

---

## Best Practices

1. **Always include error handling** in your client application
2. **Cache event data** on the client side when possible
3. **Use pagination** for large result sets
4. **Implement token refresh** mechanism for long-lived sessions
5. **Validate user input** before sending to API
6. **Handle rate limit errors** gracefully

---

## Example Usage

### Register and Create Event
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "password": "SecurePass123",
    "phone": "+2348012345678",
    "role": "creator"
  }'

# 2. Create Event
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Tech Conference 2026",
    "description": "Annual technology conference",
    "eventType": "conference",
    "startDate": "2026-06-01T09:00:00Z",
    "endDate": "2026-06-03T17:00:00Z",
    "location": {
      "address": "123 Tech Drive",
      "city": "Lagos",
      "state": "Lagos",
      "zipCode": "100001",
      "country": "Nigeria"
    },
    "capacity": 500,
    "ticketPrice": 10000,
    "category": "education"
  }'
```

---

## Support
For issues and questions, please contact support@eventful.com

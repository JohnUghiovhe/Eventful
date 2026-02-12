# Eventful API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "eventee",  // "creator" or "eventee"
  "phoneNumber": "+234800000000" // optional
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Updated",
  "phoneNumber": "+234800000000",
  "profileImage": "https://example.com/image.jpg"
}
```

---

### Events

#### Create Event (Creator only)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Amazing Concert",
  "description": "Join us for an unforgettable night of music",
  "category": "concert",
  "venue": "National Stadium",
  "location": {
    "address": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos",
    "country": "Nigeria",
    "coordinates": {
      "latitude": 6.5244,
      "longitude": 3.3792
    }
  },
  "startDate": "2024-12-31T20:00:00Z",
  "endDate": "2024-12-31T23:59:00Z",
  "ticketPrice": 5000,
  "totalTickets": 1000,
  "images": ["https://example.com/event1.jpg"],
  "status": "published",  // "draft", "published", "cancelled", "completed"
  "defaultReminder": "1_day",  // "1_hour", "1_day", "3_days", "1_week", "2_weeks"
  "tags": ["music", "concert", "entertainment"]
}
```

#### Get All Events
```http
GET /api/events?page=1&limit=10&category=concert&search=music&status=published
```

#### Get Event by ID
```http
GET /api/events/id
Authorization: Bearer <token>
```

#### Get My Events (Creator only)
```http
GET /api/events/my-events?page=1&limit=10
Authorization: Bearer <token>
```

#### Update Event Status (Creator only)
```http
PATCH /api/events/id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "published"  // "draft", "published", "cancelled", "completed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event status updated successfully",
  "data": {
    "_id": "event_id_here",
    "title": "Event Title",
    "status": "published",
    ...
  }
}
```

#### Update Event (Creator only)
```http
PUT /api/events/id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Event Title",
  "description": "Updated description"
  "category": "updated category"
}
```

#### Delete Event (Creator only)
```http
DELETE /api/events/id
Authorization: Bearer <token>
```

#### Get Share Links
```http
GET /api/events/id/share
Authorization: Bearer <token>
```

---

### Payments

#### Initialize Payment (Eventee only)
**Role:** Eventee
```http
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event_id_here",
  "reminder": "1_day"  // optional, defaults to event's default reminder
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized",
  "data": {
    "paymentUrl": "https://checkout.paystack.com/...",
    "reference": "REF-XXX-YYY",
    "accessCode": "access_code_here"
  }
}
```

#### Initialize Demo Payment (Testing only - Eventee)
**Role:** Eventee (Testing only)
```http
POST /api/payments/demo-initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "event_id_here",
  "reminder": "1_day"  // optional, defaults to event's default reminder
}
```

**Response:**
```json
{
  "success": true,
  "message": "Demo payment completed successfully! Ticket issued.",
  "data": {
    "payment": {
      "reference": "DEMO-REF-XXX",
      "amount": 5000,
      "status": "success",
      "isDemo": true
    },
    "ticket": {
      "ticketNumber": "TKT-XXX-YYY",
      "qrCode": "data:image/png;base64,...",
      "status": "paid",
      "eventTitle": "Event Title",
      "eventDate": "2026-02-14T20:00:00Z",
      "venue": "Event Venue"
    }
  }
}
```

#### Verify Payment (Eventee only)
**Role:** Eventee
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "reference": "REF-XXX-YYY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and ticket issued",
  "data": {
    "payment": { ... },
    "ticket": {
      "ticketNumber": "TKT-XXX-YYY",
      "qrCode": "data:image/png;base64,...",
      "status": "paid"
    }
  }
}
```

#### Verify Payment (Public Callback)
**Role:** Public
```http
POST /api/payments/verify-public
Content-Type: application/json

{
  "reference": "REF-XXX-YYY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "ticket": {
      "ticketNumber": "TKT-XXX-YYY",
      "qrCode": "data:image/png;base64,...",
      "status": "paid"
    }
  }
}
```

#### Get Payment Status (Public)
**Role:** Public
```http
GET /api/payments/status/REF-XXX-YYY
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "payment": { ... }
  }
}
```

#### Get My Payments (Eventee only)
**Role:** Eventee
```http
GET /api/payments
Authorization: Bearer <token>
```

#### Get Event Payments (Creator only)
**Role:** Creator
```http
GET /api/payments/event/eventId
Authorization: Bearer <token>
```

---
### Tickets

#### Get My Tickets (Eventee only)
```http
GET /api/tickets?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Ticket by ID (Eventee only)
```http
GET /api/tickets/id
Authorization: Bearer <token>
```

#### Verify Ticket (Creator only)
```http
GET /api/tickets/verify/ticketNumber
Authorization: Bearer <token>
```
### Ticket Verification (Creator only)

#### Verify Ticket by Ticket Number and Event
```http
POST /api/tickets/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "ticketNumber": "TKT-001-2026",
  "eventId": "event_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ticket verified",
  "data": {
    "_id": "ticket_id",
    "ticketNumber": "TKT-001-2026",
    "status": "paid",
    "event": {
      "_id": "event_id",
      "title": "Amazing Concert",
      "startDate": "2026-02-14T20:00:00Z"
    },
    "user": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "qrCode": "data:image/png;base64,...",
    "price": 5000,
    "reminder": "1_day",
    "scannedAt": null
  }
}
```

#### Scan Ticket (Creator only)
```http
POST /api/tickets/scan/ticketNumber
Authorization: Bearer <token>
```

#### Mark Used Ticket (Creator only)
```http
PATCH /api/tickets/id/mark-used
Authorization: Bearer <token>
```

#### Update Ticket Reminder (Eventee only)
```http
PUT /api/tickets/id/reminder
Authorization: Bearer <token>
Content-Type: application/json

{
  "reminder": "1_week"  // "1_hour", "1_day", "3_days", "1_week", "2_weeks"
}
```

#### Get Event Attendees (Creator only)
```http
GET /api/tickets/event/eventId/attendees
Authorization: Bearer <token>
```

---

### Analytics

#### Get Overall Analytics (Creator only)
```http
GET /api/analytics/overall
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 10,
    "totalAttendees": 500,
    "totalTicketsSold": 500,
    "ticketsScanned": 450,
    "totalRevenue": 2500000,
    "averageRevenuePerEvent": 250000
  }
}
```

#### Get All Events Analytics (Creator only)
```http
GET /api/analytics/events
Authorization: Bearer <token>
```

#### Get Event Analytics (Creator only)
```http
GET /api/analytics/events/eventId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": { ... },
    "metrics": {
      "ticketsSold": 100,
      "ticketsScanned": 85,
      "revenue": 500000,
      "attendanceRate": "85.00",
      "salesRate": "10.00"
    },
    "dailySales": [
      {
        "_id": "2024-01-01",
        "count": 10,
        "revenue": 50000
      }
    ]
  }
}
```

---



### Notifications

#### Create Notification
```http
POST /api/notifications
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Important Update",
  "message": "Your ticket has been confirmed for the event",
  "type": "ticket",
  "data": {
    "eventId": "event_id_here",
    "ticketId": "ticket_id_here"
  }
}
```

**Request Body:**
- `title` (required) - Notification title
- `message` (required) - Notification message
- `type` (optional) - Notification type: `info`, `success`, `warning`, `error`, `event`, `payment`, `ticket` (default: `info`)
- `data` (optional) - Additional data object with custom fields

**Response:**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "_id": "notification_id",
    "user": "user_id",
    "title": "Important Update",
    "message": "Your ticket has been confirmed for the event",
    "type": "ticket",
    "data": {
      "eventId": "event_id_here",
      "ticketId": "ticket_id_here"
    },
    "read": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get User's Notifications
```http
GET /api/notifications?page=1&limit=10&type=event&read=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `type` - Filter by notification type (optional): `info`, `success`, `warning`, `error`, `event`, `payment`, `ticket`
- `read` - Filter by read status (optional): `true` or `false`

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "user": "user_id",
        "title": "Ticket Purchased",
        "message": "You have successfully purchased a ticket for \"Concert Night\"",
        "type": "ticket",
        "data": {
          "eventId": "event_id",
          "ticketId": "ticket_id"
        },
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

#### Get Unread Notification Count
```http
GET /api/notifications/unread/count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

#### Get Notification by ID
```http
GET /api/notifications/id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "notification_id",
    "user": "user_id",
    "title": "Ticket Purchased",
    "message": "You have successfully purchased a ticket",
    "type": "ticket",
    "data": {},
    "read": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": { ... }
}
```

#### Mark All Notifications as Read
```http
PATCH /api/notifications/read/all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "modifiedCount": 5
  }
}
```

#### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

#### Delete All Notifications
```http
DELETE /api/notifications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications deleted",
  "data": {
    "deletedCount": 25
  }
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

## Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Payment: 10 requests per hour
- QR Scanning: 30 requests per minute

## Error Response Format
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error (development only)"
}
```

## Success Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

## Pagination
Paginated endpoints accept:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

Response includes:
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## Enums

### User Roles
- `creator` - Event creator
- `eventee` - Event attendee

### Event Status
- `draft` - Not published yet
- `published` - Live and accepting bookings
- `cancelled` - Event cancelled
- `completed` - Event finished

### Ticket Status
- `pending` - Payment pending
- `paid` - Payment successful
- `cancelled` - Ticket cancelled
- `used` - Ticket scanned at event

### Payment Status
- `pending` - Payment initiated
- `success` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

### Reminder Periods
- `1_hour` - 1 hour before event
- `1_day` - 1 day before event
- `3_days` - 3 days before event
- `1_week` - 1 week before event
- `2_weeks` - 2 weeks before event

### Notification Types
- `info` - General information
- `success` - Success messages
- `warning` - Warning messages
- `error` - Error notifications
- `event` - Event-related notifications
- `payment` - Payment notifications
- `ticket` - Ticket-related notifications

## Social Media Sharing

The `/api/events/:id/share` endpoint returns pre-formatted share links:

```json
{
  "success": true,
  "data": {
    "eventUrl": "http://localhost:3000/events/123",
    "shareLinks": {
      "facebook": "https://www.facebook.com/sharer/sharer.php?u=...",
      "twitter": "https://twitter.com/intent/tweet?text=...&url=...",
      "linkedin": "https://www.linkedin.com/sharing/share-offsite/?url=...",
      "whatsapp": "https://wa.me/?text=...",
      "email": "mailto:?subject=...&body=..."
    }
  }
}
```

## QR Code Format

QR codes contain JSON data:
```json
{
  "ticketNumber": "TKT-XXX-YYY",
  "eventId": "event_id_here",
  "userId": "user_id_here",
  "eventTitle": "Event Name"
}
```

## Caching

The API uses Redis caching for:
- Event listings (5 minutes)
- Individual events (10 minutes)
- Creator events (automatic invalidation on updates)

Cache is automatically invalidated on data updates.

## Email Notifications

The system automatically sends emails for:
- Welcome (on registration)
- Ticket confirmation (with QR code attachment)
- Event reminders (based on reminder settings)
- Payment confirmation

## Reminder System

- Reminders are scheduled based on the reminder period
- Eventees can change their reminder preferences per ticket
- Reminder emails include event details and ticket information
- System checks for pending reminders every 5 minutes

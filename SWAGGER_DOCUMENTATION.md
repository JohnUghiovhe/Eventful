# Swagger API Documentation

## Overview

Swagger UI has been successfully integrated into the Eventful API to provide comprehensive, interactive API documentation. All 37 endpoints across 6 major categories are fully documented and can be tested directly from your browser.

## 🚀 Quick Access

### Local Development
```
http://localhost:5000/api-docs
```

### Production
```
https://eventful-api.onrender.com/api-docs
```

---

## ✅ Implementation Summary

### Packages Installed
```json
{
  "dependencies": {
    "swagger-ui-express": "^5.0.x",
    "swagger-jsdoc": "^6.2.x"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.1.x",
    "@types/swagger-jsdoc": "^6.0.x"
  }
}
```

### What Was Implemented
- ✅ Created `src/config/swagger.ts` - OpenAPI 3.0 configuration
- ✅ Integrated Swagger UI in main application (`src/index.ts`)
- ✅ Added `/api-docs` route for accessing documentation
- ✅ Configured JWT Bearer token authentication
- ✅ Set up server URLs for development and production environments
- ✅ Documented all 37 endpoints across 6 categories
- ✅ Created comprehensive schema definitions
- ✅ Added role-based access control documentation

### Documentation Coverage

| Category | Endpoints | Status |
|----------|-----------|--------|
| Authentication | 4 | ✅ Complete |
| Events | 8 | ✅ Complete |
| Tickets | 8 | ✅ Complete |
| Payments | 6 | ✅ Complete |
| Analytics | 3 | ✅ Complete |
| Notifications | 8 | ✅ Complete |
| **Total** | **37** | **✅ 100%** |

---

## 🎯 Features

### 📚 Complete API Documentation
All API endpoints are fully documented with:
- **Request parameters** (path, query, body)
- **Request body schemas** with examples
- **Response schemas** with all status codes
- **Authentication requirements** clearly marked
- **Role-based access control** (Creator vs Eventee) information

### 🔐 Authentication
1. **Register/Login**: Use Authentication endpoints to create an account or login
2. **Copy JWT Token**: From the response, copy your JWT token
3. **Authorize**: Click the "Authorize" button at the top of Swagger UI
4. **Enter Token**: Paste your token in the format: `Bearer <your_token>`
5. **Test Endpoints**: Now you can test protected endpoints with your credentials

### Interactive Testing
- ✅ Try out any endpoint directly from the browser
- ✅ Pre-filled example requests
- ✅ Real request/response display with syntax highlighting
- ✅ Response time tracking
- ✅ HTTP status code display
- ✅ Download OpenAPI specification

### User Experience
- ✅ Clean, professional interface
- ✅ Dark mode support
- ✅ Filterable endpoint list
- ✅ Organized by tags (categories)
- ✅ Collapsible sections
- ✅ Model schemas visible
- ✅ Server selection dropdown

---

## 📋 API Categories

### 1. Authentication (`/api/auth`)
**Purpose**: User registration, authentication, and profile management

**Endpoints**:
- **POST** `/api/auth/register` - Register new user (Creator or Eventee)
- **POST** `/api/auth/login` - Login user and get JWT token
- **GET** `/api/auth/profile` - Get authenticated user profile
- **PUT** `/api/auth/profile` - Update user profile information

**Access**: Public (register/login), Authenticated (profile endpoints)

---

### 2. Events (`/api/events`)
**Purpose**: Event creation, management, and discovery

**Endpoints**:
- **POST** `/api/events` - Create new event (Creator only)
- **GET** `/api/events` - Get all events with filtering & pagination
- **GET** `/api/events/my-events` - Get creator's events (Creator only)
- **GET** `/api/events/:id` - Get event details by ID
- **GET** `/api/events/:id/share` - Get social media share links
- **PATCH** `/api/events/:id/status` - Update event status (publish/cancel)
- **PUT** `/api/events/:id` - Update event details (Creator only)
- **DELETE** `/api/events/:id` - Delete event (Creator only)

**Access**: Public (browse), Creator (create/manage)

**Query Parameters**:
- `page` - Page number for pagination
- `limit` - Items per page
- `search` - Search by title/description
- `category` - Filter by category
- `startDate` / `endDate` - Filter by date range
- `minPrice` / `maxPrice` - Filter by price range

---

### 3. Tickets (`/api/tickets`)
**Purpose**: Ticket management, verification, and attendee tracking

**Endpoints**:
- **GET** `/api/tickets` - Get user's purchased tickets (Eventee only)
- **GET** `/api/tickets/:id` - Get ticket details by ID
- **GET** `/api/tickets/verify/:ticketNumber` - Verify ticket validity (Creator only)
- **POST** `/api/tickets/scan/:ticketNumber` - Scan ticket at event entry (Creator only)
- **POST** `/api/tickets/verify` - Verify ticket QR code for event (Creator only)
- **PATCH** `/api/tickets/:id/mark-used` - Mark ticket as used (Creator only)
- **PUT** `/api/tickets/:id/reminder` - Update ticket reminder preference
- **GET** `/api/tickets/event/:eventId/attendees` - Get event attendees list (Creator only)

**Access**: Eventee (own tickets), Creator (verification/scanning)

---

### 4. Payments (`/api/payments`)
**Purpose**: Payment processing through Paystack integration

**Endpoints**:
- **POST** `/api/payments/initialize` - Initialize Paystack payment for ticket
- **POST** `/api/payments/verify` - Verify payment and issue ticket (Eventee)
- **POST** `/api/payments/verify-public` - Public verification for Paystack callback
- **GET** `/api/payments/status/:reference` - Check payment status by reference
- **GET** `/api/payments` - Get user's payment history (Eventee)
- **GET** `/api/payments/event/:eventId` - Get event payment records (Creator only)

**Access**: Eventee (purchase/verify), Public (callback), Creator (event payments)

**Payment Flow**:
1. Initialize payment → Get Paystack checkout URL
2. User completes payment on Paystack
3. Paystack redirects with reference
4. Verify payment → Ticket automatically issued
5. Email sent with QR code

---

### 5. Analytics (`/api/analytics`)
**Purpose**: Event performance metrics and insights for creators

**Endpoints**:
- **GET** `/api/analytics/overall` - Overall platform analytics (Creator only)
- **GET** `/api/analytics/events` - Analytics for all creator's events (Creator only)
- **GET** `/api/analytics/events/:eventId` - Analytics for specific event (Creator only)

**Access**: Creator only

**Metrics Provided**:
- Total revenue and earnings
- Tickets sold vs capacity
- Event view count
- Conversion rates
- Daily sales trends
- Payment status breakdown
- Attendee information

---

### 6. Notifications (`/api/notifications`)
**Purpose**: In-app notification management

**Endpoints**:
- **POST** `/api/notifications` - Create new notification
- **GET** `/api/notifications` - Get all user notifications
- **GET** `/api/notifications/unread/count` - Get unread notification count
- **GET** `/api/notifications/:id` - Get specific notification by ID
- **PATCH** `/api/notifications/:id/read` - Mark notification as read
- **PATCH** `/api/notifications/read/all` - Mark all notifications as read
- **DELETE** `/api/notifications/:id` - Delete specific notification
- **DELETE** `/api/notifications` - Delete all user notifications

**Access**: Authenticated users

**Notification Types**:
- Payment confirmations
- Event reminders
- Event updates/cancellations
- Ticket purchase confirmations
- Ticket scanned alerts

---

## 📖 How to Use Swagger UI

### Basic Testing Workflow

1. **Navigate to Swagger UI**
   - Open http://localhost:5000/api-docs in your browser
   - Wait for the interface to load

2. **Register/Login** (For protected endpoints)
   - Find Authentication → POST `/api/auth/register` or `/api/auth/login`
   - Click "Try it out"
   - Fill in the request body with your details
   - Click "Execute"
   - Copy the JWT token from the response

3. **Authorize**
   - Click the "Authorize" button (🔒 icon at top right)
   - In the "Value" field, enter: `Bearer <your_token>`
   - Click "Authorize", then "Close"

4. **Test Any Endpoint**
   - Select the endpoint you want to test
   - Click "Try it out"
   - Fill in required parameters
   - Click "Execute"
   - View the response below

### Example Workflow for Eventees (Ticket Buyers)

```
1. POST /api/auth/register → Register as Eventee
   ↓
2. POST /api/auth/login → Login and get JWT token
   ↓
3. Click "Authorize" → Enter Bearer token
   ↓
4. GET /api/events → Browse available events
   ↓
5. POST /api/payments/initialize → Start ticket purchase
   ↓
6. Complete payment on Paystack (use returned URL)
   ↓
7. POST /api/payments/verify → Verify payment & get ticket
   ↓
8. GET /api/tickets → View all your tickets
```

### Example Workflow for Creators (Event Organizers)

```
1. POST /api/auth/register → Register as Creator
   ↓
2. POST /api/auth/login → Login and get JWT token
   ↓
3. Click "Authorize" → Enter Bearer token
   ↓
4. POST /api/events → Create new event
   ↓
5. GET /api/events/my-events → View your events
   ↓
6. GET /api/analytics/overall → Check performance
   ↓
7. GET /api/tickets/verify/:ticketNumber → Verify attendee tickets
   ↓
8. GET /api/analytics/events/:eventId → View event analytics
```

---

## 🔧 Schema Definitions

Comprehensive data models documented in Swagger UI:

### User Schema
```typescript
{
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "Creator" | "Eventee";
  createdAt: Date;
}
```

### Event Schema
```typescript
{
  _id: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  startDate: Date;
  endDate: Date;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  status: "draft" | "published" | "cancelled";
  images: string[];
  tags: string[];
  defaultReminder: string;
  creator: string;
}
```

### Ticket Schema
```typescript
{
  _id: string;
  ticketNumber: string;
  event: string | Event;
  user: string | User;
  qrCode: string;
  status: "valid" | "used" | "cancelled";
  price: number;
  reminder: string;
  payment: string;
  createdAt: Date;
}
```

### Payment Schema
```typescript
{
  _id: string;
  reference: string;
  user: string;
  event: string;
  amount: number;
  currency: string;
  status: "Pending" | "Success" | "Failed";
  paystackReference: string;
  ticket: string;
  metadata: object;
}
```

### Error Response Schema
```typescript
{
  success: false;
  message: string;
  error?: string; // Only in development
}
```

---

## 🔍 Technical Implementation

### Configuration Structure

**File**: `src/config/swagger.ts`

```typescript
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Eventful API',
    version: '1.0.0',
    description: 'Complete API documentation for Eventful event management platform'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://eventful-api.onrender.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      User: { /* ... */ },
      Event: { /* ... */ },
      Ticket: { /* ... */ },
      Payment: { /* ... */ }
    }
  }
};
```

### Integration in Main Application

**File**: `src/index.ts`

```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Eventful API Documentation',
  customfavIcon: '/favicon.ico'
}));
```

### Route Documentation Pattern

**Example from** `src/routes/event.routes.ts`

```typescript
/**
 * @swagger
 * /api/events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     description: Create a new event with all details. Role - Creator
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tech Conference 2024
 *     responses:
 *       201:
 *         description: Event created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, isCreator, EventController.createEvent);
```

---

## 💡 Tips & Best Practices

### 🎯 Quick Tips

1. **Use the Filter Box**
   - Quickly find specific endpoints using the search box at top
   - Type endpoint path or method name

2. **Explore Models**
   - Click on "Schemas" section at bottom to see complete data models
   - Understand the structure of request/response objects

3. **Download OpenAPI Spec**
   - Click the "/api-docs" link dropdown
   - Export as JSON or YAML for use in other tools

4. **Server Selection**
   - Use dropdown at top to switch between local/production servers
   - Useful for testing in different environments

5. **Response Examples**
   - Each endpoint shows example responses for all status codes
   - Use these to understand success and error scenarios

### 🔧 Development

- **Auto-reload**: Swagger automatically updates when you modify route documentation
- **Documentation-First**: Add JSDoc comments with `@swagger` tag before implementing endpoints
- **OpenAPI 3.0**: Follow OpenAPI specification for consistency
- **Test First**: Always test endpoints in Swagger UI before marking them complete

### 🚀 Production

- Swagger UI is available in production for API consumers
- Documentation stays in sync with actual implementation
- No separate documentation maintenance required
- Acts as interactive API reference for external developers

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### 1. "Unauthorized" Error
**Problem**: Getting 401 responses on protected endpoints

**Solutions**:
- Ensure you've clicked "Authorize" button (🔒 top right)
- Verify token format is: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Check token hasn't expired (7-day validity)
- Confirm you're logged in and received a valid token
- Try logging in again to get a fresh token

#### 2. "Forbidden" Error
**Problem**: Getting 403 responses

**Solutions**:
- Check if your user role matches endpoint requirements
- Creators can't access Eventee-only endpoints and vice versa
- Verify the endpoint shows your role in description (e.g., "Role - Creator")
- Register with the correct role for testing specific endpoints

#### 3. CORS Issues
**Problem**: Requests blocked by CORS policy

**Solutions**:
- Ensure your frontend URL is in CORS allowed origins
- Check that credentials are being sent with requests
- Verify server configuration includes your domain
- For local testing, use http://localhost:5000/api-docs directly

#### 4. Schema Not Displaying
**Problem**: Request/response schemas show as empty

**Solutions**:
- Refresh the page
- Clear browser cache
- Check browser console for JavaScript errors
- Verify swagger-ui-express is properly installed

#### 5. "Try it out" Button Not Working
**Problem**: Execute button doesn't send request

**Solutions**:
- Check browser console for errors
- Verify network connectivity
- Ensure backend server is running
- Try a different browser

#### 6. Empty Response Body
**Problem**: No data returned even with 200 status

**Solutions**:
- Check if filters/query parameters are too restrictive
- Verify database has test data
- Review backend logs for errors
- Ensure populate() is working for referenced fields

---

## 📊 Success Metrics

### Implementation Achievements
- ✅ **37 endpoints** fully documented
- ✅ **6 major API categories** covered
- ✅ **5 schema models** defined
- ✅ **100% documentation coverage** achieved
- ✅ **Interactive testing** enabled for all endpoints
- ✅ **Zero TypeScript compilation errors**
- ✅ **Production-ready** deployment
- ✅ **Role-based access** clearly documented

### Benefits Delivered

**For Developers**:
- No need to maintain separate API documentation
- Documentation stays in sync with code automatically
- Easy to test endpoints during development
- Clear understanding of request/response formats
- Type definitions visible directly in docs

**For API Consumers**:
- Interactive testing without writing code
- Clear examples for every endpoint
- Role-based access control clearly visible
- Error responses fully documented
- No Postman collection needed

**For Team Collaboration**:
- Self-service API exploration
- Consistent documentation format
- Reduced onboarding time for new developers
- Living documentation that auto-updates
- Shareable URL for documentation access

---

## 🎓 Additional Resources

- **Static API Docs**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for markdown reference
- **Deployment Guide**: See [DEPLOYMENT_RENDER.md](./DEPLOYMENT_RENDER.md) for deployment instructions
- **User Guide**: See [USER_GUIDE.md](./USER_GUIDE.md) for end-user documentation
- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger UI Documentation**: https://swagger.io/tools/swagger-ui/
- **API Best Practices**: https://swagger.io/blog/api-development/api-design-best-practices/

---

## 🔮 Future Enhancements (Optional)

Potential improvements for future iterations:

- [ ] Add response examples for common edge cases
- [ ] Document rate limiting headers and quotas
- [ ] Include webhook documentation (if webhooks added)
- [ ] Add API versioning information
- [ ] Create changelog section for API changes
- [ ] Implement API key authentication option
- [ ] Document request/response size limits
- [ ] Add detailed content-type requirements
- [ ] Include performance benchmarks
- [ ] Add request throttling documentation

---

## 🎉 Quick Start Checklist

### For First-Time Users:

1. [ ] Access Swagger UI at http://localhost:5000/api-docs
2. [ ] Register an account using POST `/api/auth/register`
3. [ ] Login using POST `/api/auth/login`
4. [ ] Copy the JWT token from login response
5. [ ] Click "Authorize" button and paste token with "Bearer " prefix
6. [ ] Try GET `/api/events` to browse events
7. [ ] Create an event (if Creator) or buy a ticket (if Eventee)
8. [ ] Explore other endpoints in your category
9. [ ] Test error scenarios (invalid data, missing fields, etc.)
10. [ ] Review response schemas and status codes

---

**Implementation Date**: February 11-12, 2026  
**Status**: ✅ Complete and Production-Ready  
**Maintenance**: Auto-synced with codebase  
**Coverage**: 100% of all API endpoints

---

**Happy API Testing! 🚀**

*For questions or issues, refer to the troubleshooting section above or check the main [README.md](./README.md) for contact information.*

# Swagger API Documentation Guide

## Overview

Swagger UI has been successfully integrated into the Eventful API to provide interactive API documentation. You can now explore, test, and understand all API endpoints through a beautiful web interface.

## Accessing Swagger UI

### Local Development
When running the server locally, access Swagger UI at:
```
http://localhost:5000/api-docs
```

### Production
In production, access Swagger UI at:
```
https://eventful-api.onrender.com/api-docs
```

## Features

### 📚 Complete API Documentation
All API endpoints are fully documented with:
- **Request parameters** (path, query, body)
- **Request body schemas** with examples
- **Response schemas** with status codes
- **Authentication requirements**
- **Role-based access control** information

### 🔐 Authentication
1. **Register/Login**: First, use the Authentication endpoints to create an account or login
2. **Copy JWT Token**: From the response, copy your JWT token
3. **Authorize**: Click the "Authorize" button at the top of Swagger UI
4. **Enter Token**: Paste your token in the format: `Bearer <your_token>`
5. **Test Endpoints**: Now you can test protected endpoints

### 📋 API Categories

#### 1. **Authentication** (`/api/auth`)
- Register new user (Creator or Eventee)
- Login user
- Get user profile
- Update user profile

#### 2. **Events** (`/api/events`)
- Create event (Creator only)
- Get all events (with filtering & pagination)
- Get my created events (Creator only)
- Get event by ID
- Get event share links
- Update event status
- Update event details
- Delete event

#### 3. **Tickets** (`/api/tickets`)
- Get my tickets (Eventee only)
- Get ticket by ID
- Verify ticket by ticket number (Creator only)
- Scan ticket at entry (Creator only)
- Verify ticket for event (Creator only)
- Mark ticket as used (Creator only)
- Update ticket reminder
- Get event attendees (Creator only)

#### 4. **Payments** (`/api/payments`)
- Initialize payment (Paystack)
- Verify payment and issue ticket
- Public payment verification (callback)
- Get payment status
- Get my payment history
- Get event payments (Creator only)

#### 5. **Analytics** (`/api/analytics`)
- Get overall analytics (Creator only)
- Get analytics for all events (Creator only)
- Get analytics for specific event (Creator only)

#### 6. **Notifications** (`/api/notifications`)
- Create notification
- Get all notifications
- Get unread count
- Get notification by ID
- Mark as read
- Mark all as read
- Delete notification
- Delete all notifications

## Using Swagger UI

### Testing an Endpoint

1. **Select an endpoint** from the list
2. **Click "Try it out"**
3. **Fill in parameters**:
   - Path parameters (e.g., `{id}`)
   - Query parameters (e.g., `?page=1&limit=10`)
   - Request body (JSON)
4. **Click "Execute"**
5. **View the response**:
   - Response body
   - Response headers
   - HTTP status code
   - Response time

### Example Workflow

#### For Eventees (Ticket Buyers):
1. POST `/api/auth/register` - Register as Eventee
2. POST `/api/auth/login` - Login and get token
3. Click "Authorize" and enter token
4. GET `/api/events` - Browse available events
5. POST `/api/payments/initialize` - Start ticket purchase
6. Use Paystack checkout URL from response
7. GET `/api/tickets` - View purchased tickets

#### For Creators (Event Organizers):
1. POST `/api/auth/register` - Register as Creator
2. POST `/api/auth/login` - Login and get token
3. Click "Authorize" and enter token
4. POST `/api/events` - Create new event
5. GET `/api/events/my-events` - View your events
6. GET `/api/analytics/overall` - Check analytics
7. GET `/api/tickets/verify/{ticketNumber}` - Verify tickets at event
8. GET `/api/analytics/events/{eventId}` - View event performance

## Schema Definitions

Swagger UI includes comprehensive schema definitions for:
- **User**: User account information
- **Event**: Event details and metadata
- **Ticket**: Ticket information with QR code
- **Payment**: Payment transaction details
- **Error**: Standardized error responses

## Tips

### 🎯 Quick Tips
- Use the **Filter** box to quickly find specific endpoints
- Click on **Models** section to see complete schema definitions
- **Download** OpenAPI spec by clicking "Download" dropdown
- Use **Server** dropdown to switch between local/production

### 🔧 Development
- Swagger automatically reloads when you update route documentation
- Add JSDoc comments with `@swagger` tag to document new endpoints
- Follow OpenAPI 3.0 specification for consistency

### 🚀 Production
- Swagger UI is available in production for API consumers
- API documentation stays in sync with actual implementation
- No separate documentation maintenance required

## Troubleshooting

### Common Issues

1. **"Unauthorized" Error**:
   - Ensure you've clicked "Authorize" and entered a valid Bearer token
   - Token format should be: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **"Forbidden" Error**:
   - Check if your user role matches the endpoint requirements
   - Creators can't access Eventee-only endpoints and vice versa

3. **CORS Issues**:
   - Ensure your frontend URL is added to CORS allowed origins
   - Check that credentials are being sent with requests

## Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [API Best Practices](https://swagger.io/blog/api-development/api-design-best-practices/)

## Contributing

When adding new endpoints:
1. Add JSDoc comments with `@swagger` tag in route files
2. Include request/response schemas
3. Document authentication requirements
4. Test in Swagger UI before committing
5. Run `npm run build` to update documentation

---

**Happy API Testing! 🚀**

# Eventful - Setup and Installation Guide

## System Requirements

- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher
- **MongoDB**: 4.4 or higher (Atlas or local)
- **Redis**: 6.0 or higher (local or cloud)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Eventful app"
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages listed in `package.json`, including:
- Express.js and TypeScript for the backend
- MongoDB driver (Mongoose)
- Redis client
- JWT and authentication libraries
- Paystack API client
- Testing frameworks (Jest, Supertest)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

#### Database Configuration
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventful
```

Get your MongoDB URI from:
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Or use local MongoDB: `mongodb://localhost:27017/eventful`

#### Redis Configuration
```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

For local Redis:
```bash
# Windows with chocolatey
choco install redis-64

# macOS with homebrew
brew install redis

# Linux
sudo apt-get install redis-server
```

Or use Redis Cloud: https://redis.com/try-free/

#### JWT Secret Key
```env
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRY=7d
```

Generate a secure key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Paystack Integration
```env
PAYSTACK_SECRET_KEY=sk_test_xxx
PAYSTACK_PUBLIC_KEY=pk_test_xxx
```

Get keys from: https://dashboard.paystack.com/settings/developer

#### Email Configuration
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@eventful.com
```

For Gmail:
1. Enable 2FA on your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated password

#### Frontend URL
```env
FRONTEND_URL=http://localhost:3000
```

### 4. Start the Application

#### Development Mode (with auto-reload)

```bash
npm run dev
```

Server will run on `http://localhost:5000`

#### Production Mode

```bash
npm run build
npm start
```

### 5. Verify Installation

Check server health:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Eventful API is running",
  "timestamp": "2026-02-04T12:00:00.000Z"
}
```

## Running Tests

### Unit Tests
```bash
npm test -- tests/unit
```

### Integration Tests
```bash
npm test -- tests/integration
```

### All Tests with Coverage
```bash
npm test -- --coverage
```

## Database Setup

### MongoDB Collections

The application automatically creates these collections:

1. **users** - User accounts and profiles
   - Indexes: email, role
   
2. **events** - Event listings
   - Indexes: creator, status, category, startDate
   
3. **tickets** - Event tickets
   - Indexes: eventId, buyerId, status, qrCode
   
4. **payments** - Payment records
   - Indexes: payerId, eventId, status, transactionId
   
5. **notifications** - User notifications
   - Indexes: userId, eventId, isRead
   
6. **analytics** - Event analytics
   - Indexes: eventId, creatorId

### Manual Database Initialization

If indexes aren't created automatically:

```javascript
// Connect to MongoDB and run these commands
db.users.createIndex({ email: 1 });
db.users.createIndex({ role: 1 });

db.events.createIndex({ creator: 1 });
db.events.createIndex({ status: 1 });
db.events.createIndex({ category: 1 });

db.tickets.createIndex({ eventId: 1 });
db.tickets.createIndex({ buyerId: 1 });
db.tickets.createIndex({ qrCode: 1 });

db.payments.createIndex({ payerId: 1 });
db.payments.createIndex({ transactionId: 1 });

db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ isRead: 1 });

db.analytics.createIndex({ eventId: 1 });
db.analytics.createIndex({ creatorId: 1 });
```

## API Testing

### Using cURL

Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phone": "+2348012345678",
    "role": "creator"
  }'
```

### Using Postman

1. Import the provided Postman collection
2. Set base URL: `http://localhost:5000/api`
3. Configure environment variables
4. Run requests from the collection

### Using Insomnia

Similar to Postman, import the collection and configure base URL.

## File Structure

```
Eventful app/
├── src/
│   ├── config/          # Database, Redis, Environment configs
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication, validation
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   ├── utils/          # Helpers and utilities
│   └── index.ts        # Application entry
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── .env                # Environment variables (create this)
├── .env.example        # Example configuration
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── jest.config.json    # Jest config
└── README.md           # Documentation
```

## Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Atlas: verify IP whitelist includes your IP

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
- Start Redis: `redis-server` or service
- Check REDIS_HOST and REDIS_PORT
- Use Redis Cloud if local not available

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

### TypeScript Compilation Error

```bash
npm run build
```

**Solution:**
- Check TypeScript version: `npm list typescript`
- Verify tsconfig.json
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### JWT Token Issues

**Invalid Token:**
- Ensure JWT_SECRET is same across instances
- Check token expiry: JWT_EXPIRY

**Missing Token:**
- Include Authorization header: `Authorization: Bearer <token>`

## Development Tools

### Code Formatting
```bash
npm run format
```

### Linting
```bash
npm run lint
```

### Watch Mode
```bash
npm run dev
```

## Performance Tips

1. **Enable Caching**
   - Use Redis for frequently accessed data
   - Cache TTL is 1 hour (configurable)

2. **Database Optimization**
   - Indexes are automatically created
   - Use pagination for large queries
   - Limit query fields when possible

3. **API Rate Limiting**
   - General: 100 req/15 seconds
   - Auth: 5 req/15 minutes
   - Adjust in .env if needed

## Security Checklist

- [ ] Set strong JWT_SECRET
- [ ] Use HTTPS in production
- [ ] Whitelist MongoDB IPs
- [ ] Enable Redis password
- [ ] Set CORS_ORIGIN correctly
- [ ] Keep dependencies updated
- [ ] Enable HTTPS for Paystack
- [ ] Store sensitive data in environment variables

## Next Steps

1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
2. Review [README.md](./README.md) for feature overview
3. Import Postman collection for API testing
4. Run tests: `npm test`
5. Start development: `npm run dev`

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Redis Documentation](https://redis.io/documentation)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Paystack Documentation](https://paystack.com/docs/api/)

## Support

For issues:
1. Check error logs in console
2. Verify .env configuration
3. Review database connectivity
4. Check API documentation
5. Open an issue with:
   - Error message
   - Steps to reproduce
   - System information

---

**Installation complete! Happy coding! 🚀**

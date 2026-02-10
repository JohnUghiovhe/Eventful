import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import { connectRedis } from './config/redis';
import passport from './config/passport';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { NotificationService } from './services/notification.service';
import { Logger } from './utils/logger';
import { seedEvents } from './scripts/seed';
import { fixPaymentIndex } from './scripts/fixPaymentIndex';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// CORS configuration - must be before other middleware
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'https://eventful-frontend.onrender.com',
      'http://localhost:3000',
      'http://localhost:5000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(null, true); // Still allow for now, log for debugging
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Preflight requests handler
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    const shouldRunMaintenanceTasks = process.env.NODE_ENV !== 'production';

    if (shouldRunMaintenanceTasks) {
      // Fix any payment index issues
      await fixPaymentIndex();

      // Seed sample events
      await seedEvents();
    }

    // Start notification scheduler
    NotificationService.startScheduler();

    app.listen(PORT, () => {
      Logger.info(`🚀 Server is running on port ${PORT}`);
      Logger.info(`📚 API Documentation: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;

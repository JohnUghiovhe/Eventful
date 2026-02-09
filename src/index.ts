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
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Passport middleware
app.use(passport.initialize());

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

    // Fix any payment index issues
    await fixPaymentIndex();

    // Seed sample events
    await seedEvents();

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

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { initializeFirebase } from './config/firebase';
import { setupRoutes } from './routes';
import { errorMiddleware, notFoundMiddleware } from './middlewares';

async function bootstrap(): Promise<void> {
  const app = express();

  // Initialize services
  console.log('🚀 Starting API Service...');
  
  // Connect to database
  await connectDatabase();
  
  // Connect to Redis
  await connectRedis();
  
  // Initialize Firebase (optional - will warn if not configured)
  try {
    initializeFirebase();
  } catch (error) {
    console.warn('⚠️ Firebase initialization skipped - configure credentials for file uploads');
  }

  // Middleware
  app.use(cors({
    origin: config.corsOrigins,
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-service',
    });
  });

  // API routes
  setupRoutes(app);

  // Error handling
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  // Start server
  const server = app.listen(config.port, () => {
    console.log(`✅ API Service running on port ${config.port}`);
    console.log(`📍 Health check: http://localhost:${config.port}/health`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    
    server.close(async () => {
      console.log('HTTP server closed');
      
      await disconnectDatabase();
      await disconnectRedis();
      
      console.log('All connections closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start API service:', error);
  process.exit(1);
});

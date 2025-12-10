import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  apiBaseUrl: string;
  
  // Database
  databaseUrl: string;
  
  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    url?: string;
  };
  
  // JWT
  jwt: {
    secret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  
  // Firebase
  firebase: {
    projectId: string;
    storageBucket: string;
    clientEmail?: string;
    privateKey?: string;
    serviceAccountPath?: string;
  };
  
  // CORS
  corsOrigins: string[];
  
  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  
  // Logging
  logLevel: string;
}

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
  
  databaseUrl: process.env.DATABASE_URL || '',
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    url: process.env.REDIS_URL || undefined,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  },
  
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export default config;

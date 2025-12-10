import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  nodeEnv: string;
  wsPort: number;
  wsHost: string;
  
  // Redis
  redis: {
    host: string;
    port: number;
    password?: string;
    url?: string;
  };
  
  // JWT
  jwtSecret: string;
  
  // Database
  databaseUrl: string;
  
  // WebSocket
  heartbeatInterval: number;
  heartbeatTimeout: number;
  
  // Logging
  logLevel: string;
}

const requiredEnvVars = ['JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`Warning: ${envVar} is not set in environment variables`);
  }
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  wsPort: parseInt(process.env.WS_PORT || '3002', 10),
  wsHost: process.env.WS_HOST || '0.0.0.0',
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    url: process.env.REDIS_URL || undefined,
  },
  
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  
  databaseUrl: process.env.DATABASE_URL || '',
  
  heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10),
  heartbeatTimeout: parseInt(process.env.WS_HEARTBEAT_TIMEOUT || '10000', 10),
  
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export default config;

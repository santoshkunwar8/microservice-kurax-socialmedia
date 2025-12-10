import http from 'http';
import { config } from './config';
import { connectRedis, disconnectRedis, subscribeToChannels } from './config/redis';
import { createWebSocketServer, closeWebSocketServer } from './ws';
import { handleRedisMessage } from './redis';

async function bootstrap(): Promise<void> {
  console.log('🚀 Starting WebSocket Service...');

  // Connect to Redis
  await connectRedis();

  // Subscribe to Redis channels
  await subscribeToChannels(handleRedisMessage);

  // Create HTTP server for WebSocket upgrade
  const server = http.createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'ws-service',
      }));
      return;
    }

    // Default response for other HTTP requests
    res.writeHead(426, { 'Content-Type': 'text/plain' });
    res.end('Upgrade required');
  });

  // Create WebSocket server
  createWebSocketServer(server);

  // Start listening
  server.listen(config.wsPort, config.wsHost, () => {
    console.log(`✅ WebSocket Service running on ws://${config.wsHost}:${config.wsPort}`);
    console.log(`📍 Health check: http://${config.wsHost}:${config.wsPort}/health`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    // Close WebSocket server
    await closeWebSocketServer();

    // Close Redis connections
    await disconnectRedis();

    // Close HTTP server
    server.close(() => {
      console.log('HTTP server closed');
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
  console.error('❌ Failed to start WebSocket service:', error);
  process.exit(1);
});

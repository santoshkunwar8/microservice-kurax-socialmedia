import Redis, { RedisOptions } from 'ioredis';
import { config } from '../config';

const getClient = (overrideOptions: RedisOptions = {}) => {
  const commonOptions: RedisOptions = {
    ...overrideOptions,
    tls: config.redis.url?.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  };

  if (config.redis.url) {
    return new Redis(config.redis.url, commonOptions);
  }

  return new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    ...commonOptions,
  });
};

// Create Redis client for general operations
export const redis = getClient({
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Create separate Redis client for publishing
export const redisPublisher = getClient();

// Create separate Redis client for subscribing
export const redisSubscriber = getClient();

// Redis event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
  console.log('Redis connection closed');
});

redisPublisher.on('connect', () => {
  console.log('✅ Redis publisher connected');
});

redisPublisher.on('error', (error) => {
  console.error('❌ Redis publisher error:', error);
});

redisSubscriber.on('connect', () => {
  console.log('✅ Redis subscriber connected');
});

redisSubscriber.on('error', (error) => {
  console.error('❌ Redis subscriber error:', error);
});

export async function connectRedis(): Promise<void> {
  // Connection is automatic, but we can check status
  if (redis.status !== 'ready') {
    await new Promise<void>((resolve, reject) => {
      redis.once('ready', resolve);
      redis.once('error', reject);
    });
  }
}

export async function disconnectRedis(): Promise<void> {
  await Promise.all([
    redis.quit(),
    redisPublisher.quit(),
    redisSubscriber.quit(),
  ]);
  console.log('Redis connections closed');
}

// Redis Pub/Sub helper functions
export async function publish(channel: string, data: unknown): Promise<void> {
  const payload = JSON.stringify({
    channel,
    data,
    timestamp: Date.now(),
  });
  await redisPublisher.publish(channel, payload);
}

export async function subscribe(
  channel: string,
  callback: (message: unknown) => void
): Promise<void> {
  await redisSubscriber.subscribe(channel);
  redisSubscriber.on('message', (receivedChannel, message) => {
    if (receivedChannel === channel) {
      try {
        const parsed = JSON.parse(message);
        callback(parsed);
      } catch (error) {
        console.error('Failed to parse Redis message:', error);
      }
    }
  });
}

export async function unsubscribe(channel: string): Promise<void> {
  await redisSubscriber.unsubscribe(channel);
}

export default redis;

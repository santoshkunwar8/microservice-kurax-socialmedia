import Redis, { RedisOptions } from 'ioredis';
import { config } from './index';
import { REDIS_CHANNELS } from '@kuraxx/constants';

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

// Publish a message to a Redis channel
export async function publish(channel: string, data: unknown): Promise<void> {
  const payload = JSON.stringify({
    channel,
    data,
    timestamp: Date.now(),
  });
  await redisPublisher.publish(channel, payload);
}

// Subscribe to all chat-related channels
export async function subscribeToChannels(
  onMessage: (channel: string, data: unknown) => void
): Promise<void> {
  const channels = [
    REDIS_CHANNELS.MESSAGES.NEW,
    REDIS_CHANNELS.MESSAGES.SAVED,
    REDIS_CHANNELS.MESSAGES.UPDATE,
    REDIS_CHANNELS.MESSAGES.DELETE,
    REDIS_CHANNELS.PRESENCE.ONLINE,
    REDIS_CHANNELS.PRESENCE.OFFLINE,
    REDIS_CHANNELS.PRESENCE.SYNC,
    REDIS_CHANNELS.TYPING.START,
    REDIS_CHANNELS.TYPING.STOP,
    REDIS_CHANNELS.ROOM.JOIN,
    REDIS_CHANNELS.ROOM.LEAVE,
    REDIS_CHANNELS.ROOM.UPDATE,
    REDIS_CHANNELS.ROOM.CREATED,
    // Post channels
    REDIS_CHANNELS.POSTS.NEW,
    REDIS_CHANNELS.POSTS.UPDATE,
    REDIS_CHANNELS.POSTS.DELETE,
    REDIS_CHANNELS.POSTS.COMMENT,
    REDIS_CHANNELS.POSTS.LIKE,
    // Resource channels
    REDIS_CHANNELS.RESOURCES.NEW,
    REDIS_CHANNELS.RESOURCES.DELETE,
  ];

  await redisSubscriber.subscribe(...channels);
  console.log(`📡 Subscribed to Redis channels: ${channels.join(', ')}`);

  redisSubscriber.on('message', (channel, message) => {
    try {
      const parsed = JSON.parse(message);
      onMessage(channel, parsed.data);
    } catch (error) {
      console.error('Failed to parse Redis message:', error);
    }
  });
}

export default redis;

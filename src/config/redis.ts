import { createClient, RedisClientType } from 'redis';
import config from './environment';

let redisClient: RedisClientType;

export async function connectToRedis(): Promise<RedisClientType> {
  redisClient = createClient({
    socket: {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      reconnectStrategy: (retries) => Math.min(retries * 50, 500),
    },
    password: config.REDIS_PASSWORD,
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.on('connect', () => console.log('✓ Connected to Redis'));

  await redisClient.connect();
  return redisClient;
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectToRedis first.');
  }
  return redisClient;
}

export async function disconnectFromRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
    console.log('✓ Disconnected from Redis');
  }
}

export default getRedisClient;

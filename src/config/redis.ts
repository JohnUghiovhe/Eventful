import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    // Don't exit process, allow app to run without cache
  }
};

export const getRedisClient = () => redisClient;

export const getCache = async (key: string): Promise<string | null> => {
  try {
    if (!redisClient.isOpen) return null;
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: string,
  expirationInSeconds?: number
): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    if (expirationInSeconds) {
      await redisClient.setEx(key, expirationInSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const delCache = async (key: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    await redisClient.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export const clearCacheByPattern = async (pattern: string): Promise<void> => {
  try {
    if (!redisClient.isOpen) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis clear pattern error:', error);
  }
};

export default redisClient;

import { Redis } from "@upstash/redis";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60; // 15 minutes

interface MemoryRateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, MemoryRateLimitEntry>();

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch {
      return null;
    }
  }
  return null;
}

export async function checkLoginRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}> {
  const cleanIp = ip || "unknown-ip";
  const redis = getRedisClient();

  if (redis) {
    try {
      const key = `vault:ratelimit:login:${cleanIp}`;
      const count = (await redis.get<number>(key)) || 0;
      const ttl = (await redis.ttl(key)) || WINDOW_SECONDS;

      if (count >= MAX_ATTEMPTS) {
        return {
          allowed: false,
          remaining: 0,
          resetInSeconds: Math.max(1, ttl),
        };
      }

      return {
        allowed: true,
        remaining: Math.max(0, MAX_ATTEMPTS - count),
        resetInSeconds: Math.max(1, ttl),
      };
    } catch (err) {
      console.warn("Redis rate limit check fallback to memory:", err);
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = memoryStore.get(cleanIp);

  if (!entry || now > entry.resetAt) {
    return {
      allowed: true,
      remaining: MAX_ATTEMPTS,
      resetInSeconds: WINDOW_SECONDS,
    };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    const remainingSec = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.max(1, remainingSec),
    };
  }

  return {
    allowed: true,
    remaining: MAX_ATTEMPTS - entry.count,
    resetInSeconds: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export async function recordFailedLoginAttempt(ip: string): Promise<void> {
  const cleanIp = ip || "unknown-ip";
  const redis = getRedisClient();

  if (redis) {
    try {
      const key = `vault:ratelimit:login:${cleanIp}`;
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.expire(key, WINDOW_SECONDS);
      }
      return;
    } catch (err) {
      console.warn("Redis record failed attempt fallback to memory:", err);
    }
  }

  // Memory fallback
  const now = Date.now();
  const entry = memoryStore.get(cleanIp);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(cleanIp, {
      count: 1,
      resetAt: now + WINDOW_SECONDS * 1000,
    });
  } else {
    entry.count += 1;
  }
}

export async function clearLoginRateLimit(ip: string): Promise<void> {
  const cleanIp = ip || "unknown-ip";
  const redis = getRedisClient();

  if (redis) {
    try {
      await redis.del(`vault:ratelimit:login:${cleanIp}`);
    } catch {}
  }

  memoryStore.delete(cleanIp);
}

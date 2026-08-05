/**
 * Redis: response cache, guest-cart sessions, and rate limiting.
 *
 * Every helper degrades gracefully — if REDIS_URL is unset or the server is
 * unreachable, reads return null and rate limits fail OPEN. A cache outage
 * should never take down checkout or the service booking form.
 */
import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis?: Redis | null };

function createClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    console.warn('[redis] REDIS_URL not set — caching disabled');
    return null;
  }
  const client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    lazyConnect: false,
    retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
  });
  client.on('error', (e) => console.error('[redis]', e.message));
  return client;
}

export const redis = globalForRedis.redis ?? createClient();
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/* ── Cache ──────────────────────────────────────────────────────────────── */

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  if (!redis) return;
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    /* non-fatal */
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!redis || !keys.length) return;
  try {
    await redis.del(...keys);
  } catch {
    /* non-fatal */
  }
}

/** Invalidate by prefix, e.g. after a product edit: cacheInvalidate('product:') */
export async function cacheInvalidate(prefix: string): Promise<number> {
  if (!redis) return 0;
  try {
    let cursor = '0';
    let removed = 0;
    do {
      const [next, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 200);
      cursor = next;
      if (keys.length) removed += await redis.del(...keys);
    } while (cursor !== '0');
    return removed;
  } catch {
    return 0;
  }
}

/** Read-through cache wrapper. */
export async function cached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;
  const fresh = await fetcher();
  await cacheSet(key, fresh, ttl);
  return fresh;
}

/* ── Rate limiting ──────────────────────────────────────────────────────── */

/**
 * Fixed-window limiter. Returns true if the action is allowed.
 * Fails OPEN so a Redis outage never blocks a customer from booking service.
 */
/**
 * In-process fallback counter.
 *
 * WHY THIS EXISTS: rateLimit() previously returned `true` whenever Redis was
 * absent — and REDIS_URL is not set on this deployment, so every rate limit
 * in the app (orders, service bookings, OTP sends, login attempts) was
 * silently disabled. Anyone could have submitted ten thousand bookings.
 *
 * This Map is per-instance, so on serverless it only limits within one warm
 * function. That is materially weaker than Redis — but it is the difference
 * between "some limit" and "no limit at all", and it costs nothing.
 *
 * Endpoints that must be strict also enforce limits in the database (see
 * otp.service.ts counting challenge rows), which survives across instances.
 */
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const hit = memoryBuckets.get(key);

  if (!hit || hit.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });

    // Opportunistic sweep so the Map cannot grow without bound.
    if (memoryBuckets.size > 5000) {
      for (const [k, v] of memoryBuckets) if (v.resetAt <= now) memoryBuckets.delete(k);
    }
    return true;
  }

  hit.count += 1;
  return hit.count <= limit;
}

export async function rateLimit(identifier: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = `rl:${identifier}`;

  if (!redis) return memoryRateLimit(key, limit, windowSeconds);

  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return count <= limit;
  } catch {
    // Redis reachable at boot but failing now — degrade to memory rather
    // than opening the gates completely.
    return memoryRateLimit(key, limit, windowSeconds);
  }
}

export async function rateLimitStatus(identifier: string, limit: number) {
  if (!redis) return { used: 0, remaining: limit, resetIn: 0 };
  try {
    const key = `rl:${identifier}`;
    const [used, ttl] = await Promise.all([redis.get(key), redis.ttl(key)]);
    const n = Number(used ?? 0);
    return { used: n, remaining: Math.max(0, limit - n), resetIn: Math.max(0, ttl) };
  } catch {
    return { used: 0, remaining: limit, resetIn: 0 };
  }
}

/* ── Guest cart sessions ────────────────────────────────────────────────── */

export const CART_SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

export async function saveGuestCart(token: string, cartId: string) {
  await cacheSet(`cart:${token}`, { cartId }, CART_SESSION_TTL);
}

export async function loadGuestCart(token: string) {
  return cacheGet<{ cartId: string }>(`cart:${token}`);
}

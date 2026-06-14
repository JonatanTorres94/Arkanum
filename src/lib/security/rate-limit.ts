// In-memory rate limiter. Best-effort: resets on serverless cold start.
// Adequate for MVP — replace with Redis/KV for persistent enforcement.

const store = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS  = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

export function checkRateLimit(key: string): { allowed: boolean } {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}

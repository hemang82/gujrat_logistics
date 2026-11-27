/**
 * Lightweight in-memory sliding-window rate limiter for public lead & contact forms.
 * Keeps form endpoints resilient against automated spam bursts.
 */

interface RateRecord {
  timestamps: number[];
}

const store = new Map<string, RateRecord>();

export function checkRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 10 * 60 * 1000
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = store.get(key) || { timestamps: [] };
  const recent = record.timestamps.filter((ts) => now - ts < windowMs);

  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    store.set(key, { timestamps: recent });
    return { allowed: false, retryAfterSec };
  }

  recent.push(now);
  store.set(key, { timestamps: recent });

  // Opportunistic prune to keep map bounded
  if (store.size > 500) {
    for (const [entryKey, entryVal] of store.entries()) {
      const valid = entryVal.timestamps.filter((ts) => now - ts < windowMs);
      if (valid.length === 0) store.delete(entryKey);
    }
  }

  return { allowed: true };
}

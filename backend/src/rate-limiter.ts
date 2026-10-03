/**
 * In-Memory Sliding-Window Rate Limiter — BIS Intelligent Assistant Backend
 * Follows docs/api/ERROR_HANDLING.md Section 13 and docs/api/SECURITY.md Section 9
 */

import { AppError } from './errors.ts';

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private records = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;

  constructor(maxRequests = 20, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  check(identifier: string): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    let record = this.records.get(identifier);
    if (!record) {
      record = { timestamps: [] };
      this.records.set(identifier, record);
    }

    record.timestamps = record.timestamps.filter(ts => ts > windowStart);

    if (record.timestamps.length >= this.maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + this.windowMs - now) / 1000));
      throw AppError.rateLimited(retryAfterSeconds);
    }

    record.timestamps.push(now);
  }

  reset(): void {
    this.records.clear();
  }

  cleanup(): void {
    const windowStart = Date.now() - this.windowMs;
    for (const [key, record] of this.records.entries()) {
      record.timestamps = record.timestamps.filter(ts => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.records.delete(key);
      }
    }
  }
}

export const chatRateLimiter = new RateLimiter(20, 60000);
export const generalRateLimiter = new RateLimiter(60, 60000);

export function getClientIdentifier(request: Request): string {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return `user:${authHeader.slice(7, 27)}`;
  }
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }
  const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip');
  if (clientIp) {
    return `ip:${clientIp.trim()}`;
  }
  return 'ip:127.0.0.1';
}

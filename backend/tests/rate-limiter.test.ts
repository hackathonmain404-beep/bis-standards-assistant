import test from 'node:test';
import assert from 'node:assert/strict';
import { RateLimiter, getClientIdentifier } from '../src/rate-limiter.ts';
import { AppError } from '../src/errors.ts';

test('RateLimiter - enforces max requests within window', () => {
  const limiter = new RateLimiter(3, 1000); // 3 req per 1 sec

  // First 3 requests should pass
  limiter.check('client-1');
  limiter.check('client-1');
  limiter.check('client-1');

  // 4th request must throw rate limited
  assert.throws(
    () => limiter.check('client-1'),
    (err: AppError) => err.code === 'RATE_LIMITED' && err.statusCode === 429
  );

  // Different client should still be allowed
  limiter.check('client-2');
});

test('RateLimiter - resets correctly', () => {
  const limiter = new RateLimiter(2, 1000);
  limiter.check('client-a');
  limiter.check('client-a');

  assert.throws(() => limiter.check('client-a'));

  limiter.reset();
  // Should allow immediately after reset
  limiter.check('client-a');
});

test('RateLimiter - getClientIdentifier from headers', () => {
  const reqWithAuth = new Request('http://localhost', {
    headers: { Authorization: 'Bearer token-abcdef1234567890' },
  });
  assert.equal(getClientIdentifier(reqWithAuth), 'user:token-abcdef12345678');

  const reqWithIp = new Request('http://localhost', {
    headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
  });
  assert.equal(getClientIdentifier(reqWithIp), 'ip:203.0.113.195');

  const reqFallback = new Request('http://localhost');
  assert.equal(getClientIdentifier(reqFallback), 'ip:127.0.0.1');
});

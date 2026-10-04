import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError, formatErrorResponse } from '../src/errors.ts';

test('AppError - status codes and codes', () => {
  const err400 = AppError.invalidRequest('Invalid');
  assert.equal(err400.statusCode, 400);
  assert.equal(err400.code, 'INVALID_REQUEST');

  const errEmpty = AppError.emptyMessage();
  assert.equal(errEmpty.statusCode, 400);
  assert.equal(errEmpty.code, 'EMPTY_MESSAGE');

  const errLang = AppError.unsupportedLanguage('fr');
  assert.equal(errLang.statusCode, 400);
  assert.equal(errLang.code, 'UNSUPPORTED_LANGUAGE');

  const err401 = AppError.authRequired();
  assert.equal(err401.statusCode, 401);
  assert.equal(err401.code, 'AUTH_REQUIRED');

  const err403 = AppError.forbidden();
  assert.equal(err403.statusCode, 403);
  assert.equal(err403.code, 'FORBIDDEN');

  const err404 = AppError.sessionNotFound('00000000-0000-0000-0000-000000000001');
  assert.equal(err404.statusCode, 404);
  assert.equal(err404.code, 'SESSION_NOT_FOUND');

  const err429 = AppError.rateLimited(45);
  assert.equal(err429.statusCode, 429);
  assert.equal(err429.code, 'RATE_LIMITED');
  assert.equal(err429.details?.retry_after_seconds, 45);

  const err500 = AppError.internal();
  assert.equal(err500.statusCode, 500);
  assert.equal(err500.code, 'INTERNAL_ERROR');

  const err503 = AppError.aiUnavailable();
  assert.equal(err503.statusCode, 503);
  assert.equal(err503.code, 'AI_SERVICE_UNAVAILABLE');

  const err504 = AppError.timeout();
  assert.equal(err504.statusCode, 504);
  assert.equal(err504.code, 'TIMEOUT');
});

test('formatErrorResponse - formats contract-compliant response', async () => {
  const reqId = 'req-test-1234';
  const err = AppError.invalidRequest('Field missing', { field: 'message' });

  const res = formatErrorResponse(err, reqId);
  assert.equal(res.status, 400);
  assert.equal(res.headers.get('Content-Type'), 'application/json');
  assert.equal(res.headers.get('X-Request-ID'), reqId);

  const body = await res.json();
  assert.equal(body.error.code, 'INVALID_REQUEST');
  assert.equal(body.error.message, 'Field missing');
  assert.deepEqual(body.error.details, { field: 'message' });
});

test('formatErrorResponse - handles rate limit with Retry-After header', async () => {
  const reqId = 'req-test-5678';
  const err = AppError.rateLimited(30);

  const res = formatErrorResponse(err, reqId);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get('Retry-After'), '30');

  const body = await res.json();
  assert.equal(body.error.code, 'RATE_LIMITED');
});

test('formatErrorResponse - sanitizes unhandled exceptions safely', async () => {
  const reqId = 'req-test-9999';
  const unhandledErr = new Error('Database password123 connection lost');

  const res = formatErrorResponse(unhandledErr, reqId);
  assert.equal(res.status, 500);

  const body = await res.json();
  assert.equal(body.error.code, 'INTERNAL_ERROR');
  // Does not leak password or internal exception message
  assert.equal(body.error.message, 'Something went wrong on our end. Please try again.');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { validateChatRequest, validatePagination, isValidUuid, sanitizeString } from '../src/validation.ts';
import { AppError } from '../src/errors.ts';

test('Input Validation - isValidUuid', () => {
  assert.equal(isValidUuid('00000000-0000-0000-0000-000000000001'), true);
  assert.equal(isValidUuid('12345678-1234-4234-8234-123456789abc'), true);
  assert.equal(isValidUuid('invalid-uuid'), false);
  assert.equal(isValidUuid(''), false);
  assert.equal(isValidUuid(null as unknown as string), false);
});

test('Input Validation - sanitizeString', () => {
  assert.equal(sanitizeString('  hello world  '), 'hello world');
  assert.equal(sanitizeString('hello\0world'), 'helloworld');
  assert.equal(sanitizeString(123 as unknown as string), '');
});

test('Input Validation - validateChatRequest valid payloads', () => {
  const req1 = validateChatRequest({
    message: 'Which BIS standard covers electric steam irons?',
  });
  assert.equal(req1.message, 'Which BIS standard covers electric steam irons?');
  assert.equal(req1.session_id, null);
  assert.equal(req1.language, 'en');

  const req2 = validateChatRequest({
    session_id: '00000000-0000-0000-0000-000000000001',
    message: 'What about testing requirements?',
    language: 'hi',
    client_request_id: 'client-req-123',
  });
  assert.equal(req2.session_id, '00000000-0000-0000-0000-000000000001');
  assert.equal(req2.language, 'hi');
  assert.equal(req2.client_request_id, 'client-req-123');
});

test('Input Validation - validateChatRequest rejects empty or whitespace message', () => {
  assert.throws(
    () => validateChatRequest({ message: '' }),
    (err: AppError) => err.code === 'EMPTY_MESSAGE' && err.statusCode === 400
  );

  assert.throws(
    () => validateChatRequest({ message: '     ' }),
    (err: AppError) => err.code === 'EMPTY_MESSAGE' && err.statusCode === 400
  );

  assert.throws(
    () => validateChatRequest({}),
    (err: AppError) => err.code === 'EMPTY_MESSAGE' && err.statusCode === 400
  );
});

test('Input Validation - validateChatRequest rejects oversized message (> 5000 chars)', () => {
  const longMsg = 'a'.repeat(5001);
  assert.throws(
    () => validateChatRequest({ message: longMsg }),
    (err: AppError) => err.code === 'INVALID_REQUEST' && err.statusCode === 400
  );
});

test('Input Validation - validateChatRequest rejects invalid session_id format', () => {
  assert.throws(
    () => validateChatRequest({ message: 'Hello', session_id: 'not-a-uuid' }),
    (err: AppError) => err.code === 'INVALID_REQUEST' && err.statusCode === 400
  );
});

test('Input Validation - validateChatRequest rejects unsupported language', () => {
  assert.throws(
    () => validateChatRequest({ message: 'Hello', language: 'fr' }),
    (err: AppError) => err.code === 'UNSUPPORTED_LANGUAGE' && err.statusCode === 400
  );
});

test('Input Validation - validatePagination', () => {
  const urlDefault = new URL('http://localhost:8000/api/v1/sessions');
  const pagDefault = validatePagination(urlDefault);
  assert.equal(pagDefault.limit, 20);
  assert.equal(pagDefault.offset, 0);

  const urlCustom = new URL('http://localhost:8000/api/v1/sessions?limit=50&offset=10');
  const pagCustom = validatePagination(urlCustom);
  assert.equal(pagCustom.limit, 50);
  assert.equal(pagCustom.offset, 10);

  // Enforces max limit 100
  const urlExceed = new URL('http://localhost:8000/api/v1/sessions?limit=500');
  const pagExceed = validatePagination(urlExceed);
  assert.equal(pagExceed.limit, 100);

  // Rejects negative limit/offset
  const urlInvalid = new URL('http://localhost:8000/api/v1/sessions?offset=-5');
  assert.throws(
    () => validatePagination(urlInvalid),
    (err: AppError) => err.code === 'INVALID_REQUEST' && err.statusCode === 400
  );
});

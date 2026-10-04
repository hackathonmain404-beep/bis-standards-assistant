import test from 'node:test';
import assert from 'node:assert/strict';
import { AssistantQueryService, ConversationService } from '../src/services.ts';
import { createInMemorySupabaseClient } from '../src/mock-db.ts';
import { MockAIServiceClient } from '../src/ai-client.ts';
import { chatRateLimiter, getClientIdentifier } from '../src/rate-limiter.ts';
import { ChatRequestZodSchema } from '../src/validation.ts';
import { AIServiceResponseZodSchema, validateAiServiceResponse } from '../src/ai-validator.ts';
import { AppError } from '../src/errors.ts';

test('Concurrency - Concurrent duplicate requests attach to the same in-flight execution', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const assistantService = new AssistantQueryService(mockDb, mockAi);

  const payload = {
    message: 'What are the safety requirements for electric toasters?',
    language: 'en' as const,
    client_request_id: 'concurrent-race-key-999',
  };

  // Launch two concurrent requests simultaneously with identical client_request_id
  const [resp1, resp2] = await Promise.all([
    assistantService.processChat(payload, null, 'req-concurrent-1'),
    assistantService.processChat(payload, null, 'req-concurrent-2'),
  ]);

  // Both should resolve to the identical response object and session
  assert.equal(resp1.session_id, resp2.session_id);
  assert.equal(resp1.message_id, resp2.message_id);
  assert.equal(resp1.response.text, resp2.response.text);
});

test('Rate Limiter - Isolates authenticated users into separate user buckets', () => {
  const reqWithIp = new Request('http://localhost:8000/api/v1/chat', {
    headers: { 'x-forwarded-for': '198.51.100.1' },
  });

  const userAId = 'user-uuid-111';
  const userBId = 'user-uuid-222';

  const keyUserA = getClientIdentifier(reqWithIp, userAId);
  const keyUserB = getClientIdentifier(reqWithIp, userBId);
  const keyAnon = getClientIdentifier(reqWithIp, null);

  assert.equal(keyUserA, `user:${userAId}`);
  assert.equal(keyUserB, `user:${userBId}`);
  assert.equal(keyAnon, 'ip:198.51.100.1');

  // Verify User A does not exhaust User B's bucket
  const isolatedLimiter = chatRateLimiter;
  // Should not throw
  isolatedLimiter.check(keyUserA);
  isolatedLimiter.check(keyUserB);
});

test('ConversationService - Anonymous callers cannot list authenticated user sessions', async () => {
  const mockDb = createInMemorySupabaseClient();
  const conversationService = new ConversationService(mockDb);
  const userA = { id: 'user-alice-456', email: 'alice@example.com' };

  // Create an authenticated session
  await mockDb.from('sessions').insert({
    id: 'session-alice-1',
    user_id: userA.id,
    title: 'Alice confidential inquiry',
    is_active: true,
  });

  // Create a guest session
  await mockDb.from('sessions').insert({
    id: 'session-guest-1',
    user_id: null,
    title: 'Public guest inquiry',
    is_active: true,
  });

  // Guest lists sessions -> should only see guest sessions (excludes Alice's session)
  const guestList = await conversationService.listSessions(null, 10, 0);
  assert.ok(guestList.sessions.some(s => s.id === 'session-guest-1'));
  assert.ok(!guestList.sessions.some(s => s.id === 'session-alice-1'));

  // Alice lists sessions -> should only see Alice session
  const aliceList = await conversationService.listSessions(userA, 10, 0);
  assert.equal(aliceList.sessions.length, 1);
  assert.equal(aliceList.sessions[0].id, 'session-alice-1');
});

test('Zod Schemas - ChatRequestZodSchema validates declarative constraints', () => {
  // Valid
  const valid = ChatRequestZodSchema.safeParse({
    message: 'Valid BIS inquiry',
    language: 'en',
    client_request_id: 'req-123',
  });
  assert.equal(valid.success, true);

  // Missing message
  const missing = ChatRequestZodSchema.safeParse({});
  assert.equal(missing.success, false);

  // Invalid language
  const invalidLang = ChatRequestZodSchema.safeParse({
    message: 'Test',
    language: 'french',
  });
  assert.equal(invalidLang.success, false);
});

test('Zod Schemas - AIServiceResponseZodSchema validates schema contracts', () => {
  const valid = AIServiceResponseZodSchema.safeParse({
    response_text: 'According to IS 1234...',
    intent: 'STANDARD_INQUIRY',
    citations: [],
    metadata: { model: 'mock-model' },
  });
  assert.equal(valid.success, true);

  // Empty response text
  const empty = AIServiceResponseZodSchema.safeParse({
    response_text: '',
  });
  assert.equal(empty.success, false);
});

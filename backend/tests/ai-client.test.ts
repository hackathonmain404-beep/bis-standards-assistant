import test from 'node:test';
import assert from 'node:assert/strict';
import { MockAIServiceClient, RealAIServiceClient } from '../src/ai-client.ts';
import { AppError } from '../src/errors.ts';

test('AI Client - MockAIServiceClient standard query', async () => {
  const client = new MockAIServiceClient();
  const res = await client.queryAssistant(
    {
      session_id: 'test-session',
      query: 'I make electric steam irons',
      conversation_history: [],
      language: 'en',
    },
    'req-1'
  );

  assert.equal(res.intent, 'PRODUCT_DISCOVERY');
  assert.ok(res.response_text.includes('[DEMO TEST RESPONSE]'));
  assert.ok(res.citations.length > 0);
  assert.equal(res.citations[0].standard_id, 'IS 302 (Part 2/Sec 3):2007');
  assert.equal(res.needs_clarification, false);
  assert.ok(res.follow_up_suggestions && res.follow_up_suggestions.length > 0);
});

test('AI Client - MockAIServiceClient water query returns IS 14543', async () => {
  const client = new MockAIServiceClient();
  const res = await client.queryAssistant(
    {
      session_id: 'test-session',
      query: 'What standard applies to packaged drinking water?',
      conversation_history: [],
      language: 'en',
    },
    'req-2'
  );

  assert.equal(res.intent, 'PRODUCT_DISCOVERY');
  assert.ok(res.citations.some(c => c.standard_id === 'IS 14543:2016'));
});

test('AI Client - MockAIServiceClient clarification flow', async () => {
  const client = new MockAIServiceClient();
  const res = await client.queryAssistant(
    {
      session_id: 'test-session',
      query: 'i make products',
      conversation_history: [],
      language: 'en',
    },
    'req-3'
  );

  assert.equal(res.intent, 'CLARIFICATION_NEEDED');
  assert.equal(res.needs_clarification, true);
  assert.ok(res.clarification_questions && res.clarification_questions.length > 0);
});

test('AI Client - MockAIServiceClient insufficient evidence flow', async () => {
  const client = new MockAIServiceClient();
  const res = await client.queryAssistant(
    {
      session_id: 'test-session',
      query: 'unregistered unknown item xyz',
      conversation_history: [],
      language: 'en',
    },
    'req-4'
  );

  assert.equal(res.intent, 'OUT_OF_SCOPE');
  assert.equal(res.citations.length, 0);
  assert.ok(res.response_text.includes('could not find relevant BIS information'));
});

test('AI Client - RealAIServiceClient timeout handling', async () => {
  // Use a non-routable port or unreachable IP with 10ms timeout to verify AbortController timeout handling
  const client = new RealAIServiceClient('http://192.0.2.1:81', '', 10, 0);

  await assert.rejects(
    async () => {
      await client.queryAssistant(
        {
          session_id: 'timeout-session',
          query: 'Test query',
          conversation_history: [],
        },
        'req-timeout'
      );
    },
    (err: AppError) => err.code === 'TIMEOUT' || err.code === 'AI_SERVICE_UNAVAILABLE'
  );
});

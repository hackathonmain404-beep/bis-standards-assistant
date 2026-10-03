import test from 'node:test';
import assert from 'node:assert/strict';
import { AssistantQueryService, ConversationService } from '../src/services.ts';
import { createInMemorySupabaseClient } from '../src/mock-db.ts';
import { MockAIServiceClient } from '../src/ai-client.ts';
import { AppError } from '../src/errors.ts';

test('Multi-User RLS - User A can create and access own session', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const assistantService = new AssistantQueryService(mockDb, mockAi);
  const conversationService = new ConversationService(mockDb);

  const userA = { id: 'user-aaa-111', email: 'alice@example.com' };

  const chatResp = await assistantService.processChat(
    { message: 'IS 302 details for electric irons', language: 'en' },
    userA,
    'req-alice-1'
  );

  assert.ok(chatResp.session_id);

  // User A should be able to read own session
  const history = await conversationService.getSessionHistory(chatResp.session_id, userA);
  assert.equal(history.session.id, chatResp.session_id);

  // Verify DB record has user_id correctly persisted
  const { data: dbSession } = await mockDb.from('sessions').select('user_id').eq('id', chatResp.session_id).single();
  assert.equal(dbSession.user_id, userA.id);
});

test('Multi-User RLS - User B cannot view User A session (403 Forbidden)', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const assistantService = new AssistantQueryService(mockDb, mockAi);
  const conversationService = new ConversationService(mockDb);

  const userA = { id: 'user-aaa-111', email: 'alice@example.com' };
  const userB = { id: 'user-bbb-222', email: 'bob@example.com' };

  const chatResp = await assistantService.processChat(
    { message: 'Secret manufacturing query from Alice', language: 'en' },
    userA,
    'req-alice-2'
  );

  // Bob tries to read Alice's session -> must throw 403
  await assert.rejects(
    async () => {
      await conversationService.getSessionHistory(chatResp.session_id, userB);
    },
    (err: any) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'FORBIDDEN');
      return true;
    }
  );
});

test('Multi-User RLS - User B cannot append messages to User A session', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const assistantService = new AssistantQueryService(mockDb, mockAi);

  const userA = { id: 'user-aaa-111', email: 'alice@example.com' };
  const userB = { id: 'user-bbb-222', email: 'bob@example.com' };

  const chatResp = await assistantService.processChat(
    { message: 'Session owned by Alice', language: 'en' },
    userA,
    'req-alice-3'
  );

  // Bob attempts to chat into Alice's session -> must throw 403
  await assert.rejects(
    async () => {
      await assistantService.processChat(
        { message: 'Bob tampering attempt', session_id: chatResp.session_id, language: 'en' },
        userB,
        'req-bob-tamper'
      );
    },
    (err: any) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'FORBIDDEN');
      return true;
    }
  );
});

test('Multi-User RLS - User B cannot delete User A session', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const assistantService = new AssistantQueryService(mockDb, mockAi);
  const conversationService = new ConversationService(mockDb);

  const userA = { id: 'user-aaa-111', email: 'alice@example.com' };
  const userB = { id: 'user-bbb-222', email: 'bob@example.com' };

  const chatResp = await assistantService.processChat(
    { message: 'Alice session for delete test', language: 'en' },
    userA,
    'req-alice-4'
  );

  // Bob tries to delete Alice's session -> must throw 403
  await assert.rejects(
    async () => {
      await conversationService.deleteSession(chatResp.session_id, userB);
    },
    (err: any) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      assert.equal(err.code, 'FORBIDDEN');
      return true;
    }
  );
});

test('Multi-User RLS - Anonymous user cannot delete a user-owned session', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const assistantService = new AssistantQueryService(mockDb, mockAi);
  const conversationService = new ConversationService(mockDb);

  const userA = { id: 'user-aaa-111', email: 'alice@example.com' };

  const chatResp = await assistantService.processChat(
    { message: 'Alice session', language: 'en' },
    userA,
    'req-alice-5'
  );

  // Anonymous caller (null user) tries to delete authenticated session -> must throw 403
  await assert.rejects(
    async () => {
      await conversationService.deleteSession(chatResp.session_id, null);
    },
    (err: any) => {
      assert.ok(err instanceof AppError);
      assert.equal(err.statusCode, 403);
      return true;
    }
  );
});

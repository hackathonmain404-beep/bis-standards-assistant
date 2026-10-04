import test from 'node:test';
import assert from 'node:assert/strict';
import { AssistantQueryService, ConversationService, HealthService } from '../src/services.ts';
import { MockAIServiceClient } from '../src/ai-client.ts';
import { AppError } from '../src/errors.ts';

// In-memory Supabase Mock Client for isolated deterministic testing
function createInMemorySupabaseClient() {
  const sessions: any[] = [];
  const messages: any[] = [];
  const citations: any[] = [];
  const appConfig: any[] = [{ key: 'app_name', value: 'BIS Intelligent Assistant' }];

  function clone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  }

  return {
    _db: { sessions, messages, citations, appConfig },
    from(tableName: string) {
      let currentTable: any[];
      if (tableName === 'sessions') currentTable = sessions;
      else if (tableName === 'messages') currentTable = messages;
      else if (tableName === 'citations') currentTable = citations;
      else if (tableName === 'app_config') currentTable = appConfig;
      else currentTable = [];

      let filters: ((item: any) => boolean)[] = [];
      let sortFn: ((a: any, b: any) => number) | null = null;
      let limitCount: number | null = null;
      let rangeOffset = 0;
      let rangeLimit: number | null = null;
      let isSingle = false;

      let pendingUpdate: any = null;
      let pendingDelete = false;
      let lastInserted: any[] | null = null;

      const queryBuilder: any = {
        select(_cols?: string, _opts?: any) {
          return queryBuilder;
        },
        eq(col: string, val: any) {
          filters.push(item => item[col] === val);
          return queryBuilder;
        },
        gt(col: string, val: any) {
          filters.push(item => item[col] > val);
          return queryBuilder;
        },
        in(col: string, vals: any[]) {
          filters.push(item => vals.includes(item[col]));
          return queryBuilder;
        },
        order(col: string, opts?: { ascending?: boolean }) {
          const asc = opts?.ascending !== false;
          sortFn = (a, b) => {
            if (a[col] < b[col]) return asc ? -1 : 1;
            if (a[col] > b[col]) return asc ? 1 : -1;
            return 0;
          };
          return queryBuilder;
        },
        limit(count: number) {
          limitCount = count;
          return queryBuilder;
        },
        range(fromIdx: number, toIdx: number) {
          rangeOffset = fromIdx;
          rangeLimit = toIdx - fromIdx + 1;
          return queryBuilder;
        },
        single() {
          isSingle = true;
          return queryBuilder;
        },
        insert(payload: any) {
          const rows = Array.isArray(payload) ? payload : [payload];
          const inserted: any[] = [];
          for (const row of rows) {
            const item = {
              id: row.id || `uuid-${Math.random().toString(36).slice(2, 10)}`,
              created_at: row.created_at || new Date().toISOString(),
              updated_at: row.updated_at || new Date().toISOString(),
              ...row,
            };
            currentTable.push(item);
            inserted.push(item);
          }
          lastInserted = inserted;
          return queryBuilder;
        },
        update(payload: any) {
          pendingUpdate = payload;
          return queryBuilder;
        },
        delete() {
          pendingDelete = true;
          return queryBuilder;
        },
        then(resolve: any, _reject: any) {
          if (pendingDelete) {
            let deletedCount = 0;
            for (let i = currentTable.length - 1; i >= 0; i--) {
              if (filters.every(f => f(currentTable[i]))) {
                currentTable.splice(i, 1);
                deletedCount++;
              }
            }
            return resolve({ data: null, error: null, count: deletedCount });
          }

          if (pendingUpdate) {
            let updatedCount = 0;
            for (const item of currentTable) {
              if (filters.every(f => f(item))) {
                Object.assign(item, pendingUpdate);
                updatedCount++;
              }
            }
            return resolve({ data: null, error: null, count: updatedCount });
          }

          if (lastInserted) {
            return resolve({
              data: isSingle ? clone(lastInserted[0]) : clone(lastInserted),
              error: null,
            });
          }

          let result = currentTable.filter(item => filters.every(f => f(item)));
          if (sortFn) result.sort(sortFn);
          if (rangeLimit !== null) {
            result = result.slice(rangeOffset, rangeOffset + rangeLimit);
          } else if (limitCount !== null) {
            result = result.slice(0, limitCount);
          }

          if (isSingle) {
            const item = result[0] ? clone(result[0]) : null;
            return resolve({
              data: item,
              error: item ? null : { message: 'Not found' },
            });
          }

          return resolve({
            data: clone(result),
            count: currentTable.filter(item => filters.every(f => f(item))).length,
            error: null,
          });
        },
      };

      return queryBuilder;
    },
  };
}

test('AssistantQueryService - creates new session and stores conversation turn', async () => {
  const mockDb = createInMemorySupabaseClient() as any;
  const aiClient = new MockAIServiceClient();
  const service = new AssistantQueryService(mockDb, aiClient);

  const res = await service.processChat(
    {
      message: 'What BIS standards apply to electric steam irons?',
      language: 'en',
    },
    null,
    'req-chat-1'
  );

  assert.ok(res.session_id, 'Must generate a session_id');
  assert.ok(res.message_id, 'Must return assistant message_id');
  assert.equal(res.response.intent, 'PRODUCT_DISCOVERY');
  assert.ok(res.response.citations.length > 0);
  assert.ok(res.response.text.includes('[DEMO TEST RESPONSE]'));

  // Verify in-memory persistence
  assert.equal(mockDb._db.sessions.length, 1);
  assert.equal(mockDb._db.messages.length, 2); // 1 user + 1 assistant
  assert.ok(mockDb._db.citations.length > 0);
});

test('AssistantQueryService - enforces session ownership (User A cannot access User B session)', async () => {
  const mockDb = createInMemorySupabaseClient() as any;
  const aiClient = new MockAIServiceClient();
  const service = new AssistantQueryService(mockDb, aiClient);

  // User B creates a session
  mockDb._db.sessions.push({
    id: 'session-user-b',
    user_id: 'user-b-id',
    title: 'User B confidential session',
    is_active: true,
  });

  // User A attempts to send a message to User B's session
  const callerUserA = { id: 'user-a-id', email: 'user-a@example.com' };

  await assert.rejects(
    async () => {
      await service.processChat(
        {
          session_id: 'session-user-b',
          message: 'Trying to snoop',
        },
        callerUserA,
        'req-hack'
      );
    },
    (err: AppError) => err.code === 'FORBIDDEN' && err.statusCode === 403
  );
});

test('AssistantQueryService - enforces idempotency with client_request_id', async () => {
  const mockDb = createInMemorySupabaseClient() as any;
  let aiCallCount = 0;
  const customAiClient = {
    async queryAssistant(req: any, id: string) {
      aiCallCount++;
      return new MockAIServiceClient().queryAssistant(req, id);
    },
    async healthCheck() {
      return true;
    },
  };

  const service = new AssistantQueryService(mockDb, customAiClient as any);

  const chatReq = {
    message: 'Double click message test',
    client_request_id: 'unique-idempotency-key-123',
  };

  // First request
  const res1 = await service.processChat(chatReq, null, 'req-1');
  assert.equal(aiCallCount, 1);

  // Second duplicate request with identical client_request_id and session_id
  const res2 = await service.processChat(
    {
      ...chatReq,
      session_id: res1.session_id,
    },
    null,
    'req-2'
  );

  // AI must NOT be invoked again; response should be served from existing message
  assert.equal(aiCallCount, 1, 'AI should not be called a second time on idempotent request');
  assert.equal(res2.response.text, res1.response.text);
  assert.equal(res2.message_id, res1.message_id);
});

test('ConversationService - list, get history, and delete with ownership protection', async () => {
  const mockDb = createInMemorySupabaseClient() as any;
  const service = new ConversationService(mockDb);

  const user1 = { id: 'user-1-id' };
  const user2 = { id: 'user-2-id' };

  // Setup test session for user 1
  const session1 = {
    id: 'sess-1',
    user_id: user1.id,
    title: 'User 1 Session',
    language: 'en',
    created_at: '2026-10-03T10:00:00Z',
    updated_at: '2026-10-03T10:00:00Z',
    is_active: true,
  };
  mockDb._db.sessions.push(session1);

  // List sessions
  const list = await service.listSessions(user1, 10, 0);
  assert.equal(list.sessions.length, 1);
  assert.equal(list.sessions[0].id, 'sess-1');

  // User 2 cannot list user 1 sessions
  const list2 = await service.listSessions(user2, 10, 0);
  assert.equal(list2.sessions.length, 0);

  // User 2 cannot get history of user 1 session
  await assert.rejects(
    async () => {
      await service.getSessionHistory('sess-1', user2);
    },
    (err: AppError) => err.code === 'FORBIDDEN'
  );

  // User 1 can get history
  const history = await service.getSessionHistory('sess-1', user1);
  assert.equal(history.session.id, 'sess-1');

  // User 2 cannot delete user 1 session
  await assert.rejects(
    async () => {
      await service.deleteSession('sess-1', user2);
    },
    (err: AppError) => err.code === 'FORBIDDEN'
  );

  // User 1 can delete
  const delRes = await service.deleteSession('sess-1', user1);
  assert.equal(delRes.deleted, true);
  assert.equal(mockDb._db.sessions.length, 0);
});

test('HealthService - returns healthy component status', async () => {
  const mockDb = createInMemorySupabaseClient() as any;
  const aiClient = new MockAIServiceClient();
  const service = new HealthService(mockDb, aiClient);

  const health = await service.check();
  assert.equal(health.status, 'healthy');
  assert.equal(health.version, '0.1.0');
  assert.equal(health.components.database, 'healthy');
  assert.equal(health.components.ai_service, 'healthy');
  assert.equal(health.components.vector_store, 'healthy');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { AssistantQueryService, ConversationService } from '../src/services.ts';
import { createInMemorySupabaseClient } from '../src/mock-db.ts';
import { MockAIServiceClient } from '../src/ai-client.ts';

test('Request Tracking - records request lifecycle states and audit logs', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const assistantService = new AssistantQueryService(mockDb, mockAi);

  const response = await assistantService.processChat(
    {
      message: 'What standard applies to domestic electric steam irons?',
      language: 'en',
      client_request_id: 'track-test-uuid-001',
    },
    { id: 'user-test-123', email: 'user@example.com' },
    'req-trace-123'
  );

  assert.ok(response.session_id);
  assert.ok(response.message_id);

  // Verify assistant_requests tracking table records
  const trackedRequests = mockDb._db.assistantRequests;
  assert.ok(trackedRequests.length >= 1, 'Should record in assistant_requests');
  const lastRequest = trackedRequests[trackedRequests.length - 1];
  assert.equal(lastRequest.status, 'COMPLETED');
  assert.equal(lastRequest.client_request_id, 'track-test-uuid-001');
  assert.equal(lastRequest.user_id, 'user-test-123');
  assert.ok(typeof lastRequest.latency_ms === 'number');

  // Verify audit_logs records
  const auditLogs = mockDb._db.auditLogs;
  assert.ok(auditLogs.length >= 2, 'Should record CONVERSATION_CREATED and ASSISTANT_COMPLETED');

  const creationLog = auditLogs.find((l: any) => l.event_type === 'CONVERSATION_CREATED');
  assert.ok(creationLog, 'CONVERSATION_CREATED audit log must exist');
  assert.equal(creationLog.user_id, 'user-test-123');

  const completedLog = auditLogs.find((l: any) => l.event_type === 'ASSISTANT_COMPLETED');
  assert.ok(completedLog, 'ASSISTANT_COMPLETED audit log must exist');
  assert.equal(completedLog.user_id, 'user-test-123');
});

test('Audit Logging - records CONVERSATION_DELETED on session removal', async () => {
  const mockDb = createInMemorySupabaseClient();
  const conversationService = new ConversationService(mockDb);

  // Create session first
  const { data: newSession } = await mockDb.from('sessions').insert({
    user_id: 'user-delete-test',
    title: 'Session to be deleted',
    language: 'en',
    is_active: true,
  }).select('id').single();

  const result = await conversationService.deleteSession(
    newSession.id,
    { id: 'user-delete-test', email: 'delete@example.com' }
  );

  assert.equal(result.deleted, true);

  const deleteLog = mockDb._db.auditLogs.find((l: any) => l.event_type === 'CONVERSATION_DELETED');
  assert.ok(deleteLog, 'CONVERSATION_DELETED audit log must exist');
  assert.equal(deleteLog.resource_id, newSession.id);
  assert.equal(deleteLog.user_id, 'user-delete-test');
});

/**
 * Comprehensive System Verification Test Suite — BIS Intelligent Assistant
 * Validates that all backend capabilities, API endpoints, citations, validations,
 * idempotency, and the 40 test user personas function accurately.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { createServerClient } from '../src/supabase-client.ts';
import { getBackendConfig } from '../src/config.ts';
import { getAiServiceClient } from '../src/ai-client.ts';
import { AssistantQueryService, ConversationService, HealthService } from '../src/services.ts';
import { validateChatRequest, isValidUuid } from '../src/validation.ts';
import { AppError } from '../src/errors.ts';

const config = getBackendConfig();
const supabase = createServerClient();
const aiClient = getAiServiceClient(config);

test('System Verification - 1. Component Health and Readiness Probes', async () => {
  const healthService = new HealthService(supabase, aiClient);
  
  const health = await healthService.check();
  assert.equal(health.status, 'healthy');
  assert.equal(health.version, '0.1.0');
  assert.ok(health.components.database === 'healthy');
  assert.ok(health.components.ai_service === 'healthy');

  const ready = await healthService.readiness();
  assert.equal(ready.ready, true);
  assert.equal(ready.database, 'connected');
  assert.equal(ready.ai_service, 'ready (mock)');
});

test('System Verification - 2. Input Validation and Security Guardrails', () => {
  // Empty message must be rejected
  assert.throws(
    () => validateChatRequest({ message: '   ' }),
    (err: AppError) => err.code === 'EMPTY_MESSAGE' && err.statusCode === 400
  );

  // Oversized message (> 5000 characters) must be rejected
  assert.throws(
    () => validateChatRequest({ message: 'x'.repeat(5001) }),
    (err: AppError) => err.code === 'INVALID_REQUEST' && err.statusCode === 400
  );

  // Invalid UUID session_id must be rejected
  assert.throws(
    () => validateChatRequest({ message: 'Hello', session_id: 'session-invalid-123' }),
    (err: AppError) => err.code === 'INVALID_REQUEST' && err.statusCode === 400
  );

  // Supported languages (en, hi, or) must be accepted
  const validEn = validateChatRequest({ message: 'Valid query', language: 'en' });
  assert.equal(validEn.language, 'en');

  const validHi = validateChatRequest({ message: 'वैध प्रश्न', language: 'hi' });
  assert.equal(validHi.language, 'hi');

  const validOr = validateChatRequest({ message: 'ବୈଧ ପ୍ରଶ୍ନ', language: 'or' });
  assert.equal(validOr.language, 'or');
});

test('System Verification - 3. End-to-End Chat Query for Electric Irons (IS 302)', async () => {
  const assistantService = new AssistantQueryService(supabase, aiClient);
  
  const chatResponse = await assistantService.processChat({
    message: 'Which Indian Standard applies to domestic electric steam irons?',
    language: 'en',
  }, null, 'sys-test-req-iron');

  assert.ok(isValidUuid(chatResponse.session_id), 'session_id must be a valid UUID');
  assert.ok(isValidUuid(chatResponse.message_id), 'message_id must be a valid UUID');
  assert.ok(chatResponse.response.text.includes('IS 302'), 'Response must cite IS 302');
  assert.equal(chatResponse.response.intent, 'PRODUCT_DISCOVERY');
  assert.ok(Array.isArray(chatResponse.response.citations), 'citations must be an array');
  assert.ok(chatResponse.response.citations.length >= 1, 'must contain at least 1 citation');
  
  const citation = chatResponse.response.citations[0];
  assert.ok(citation.standard_id?.includes('IS 302'), 'citation standard_id must match IS 302');
  assert.ok(citation.clause, 'citation must specify standard clause');
  assert.ok(citation.snippet, 'citation must contain factual snippet');
});

test('System Verification - 4. End-to-End Chat Query for Packaged Drinking Water (IS 14543)', async () => {
  const assistantService = new AssistantQueryService(supabase, aiClient);
  
  const chatResponse = await assistantService.processChat({
    message: 'What are the quality and licensing requirements for packaged drinking water?',
    language: 'en',
  }, null, 'sys-test-req-water');

  assert.ok(isValidUuid(chatResponse.session_id));
  assert.ok(chatResponse.response.text.includes('IS 14543'), 'Response must cite IS 14543');
  assert.ok(chatResponse.response.citations.some(c => c.standard_id?.includes('IS 14543')));
});

test('System Verification - 5. Multi-turn Session Continuation', async () => {
  const assistantService = new AssistantQueryService(supabase, aiClient);

  // Turn 1
  const turn1 = await assistantService.processChat({
    message: 'What standard applies to electric irons?',
    language: 'en',
  }, null, 'sys-turn-1');

  const sessionId = turn1.session_id;

  // Turn 2 in the same session
  const turn2 = await assistantService.processChat({
    session_id: sessionId,
    message: 'What testing requirements are mandated under this standard?',
    language: 'en',
  }, null, 'sys-turn-2');

  assert.equal(turn2.session_id, sessionId, 'Turn 2 must preserve the same session_id');
  assert.notEqual(turn2.message_id, turn1.message_id, 'Each turn must have a unique message_id');
});

test('System Verification - 6. Idempotency Protection against Duplicate Network Retries', async () => {
  const assistantService = new AssistantQueryService(supabase, aiClient);
  const idempotencyKey = 'idempotent-key-' + Date.now();

  const firstCall = await assistantService.processChat({
    message: 'What are the safety standards for electric irons?',
    client_request_id: idempotencyKey,
  }, null, 'idemp-req-1');

  const secondCall = await assistantService.processChat({
    message: 'What are the safety standards for electric irons?',
    session_id: firstCall.session_id,
    client_request_id: idempotencyKey,
  }, null, 'idemp-req-2');

  assert.equal(firstCall.session_id, secondCall.session_id);
  assert.equal(firstCall.message_id, secondCall.message_id);
  assert.equal(firstCall.response.text, secondCall.response.text);
});

test('System Verification - 7. Conversation History Management (List, Get, Delete)', async () => {
  const assistantService = new AssistantQueryService(supabase, aiClient);
  const convService = new ConversationService(supabase);

  // Create a session with a query (anonymous)
  const res = await assistantService.processChat({
    message: 'Testing session lifecycle management',
    language: 'en',
  }, null, 'lifecycle-req');

  const sessionId = res.session_id;

  // List sessions
  const sessionsList = await convService.listSessions(null, 10, 0);
  assert.ok(sessionsList.sessions.some(s => s.id === sessionId));

  // Retrieve full history with citations
  const history = await convService.getSessionHistory(sessionId, null);
  assert.ok(history, 'Session history must exist');
  assert.ok(history.messages.length >= 2, 'History must contain user and assistant messages');

  // Delete session
  const deleteResult = await convService.deleteSession(sessionId, null);
  assert.equal(deleteResult.deleted, true);

  // Confirm deletion
  await assert.rejects(
    async () => {
      await convService.getSessionHistory(sessionId, null);
    },
    (err: AppError) => err.code === 'SESSION_NOT_FOUND' || err.statusCode === 404
  );
});

test('System Verification - 8. 40 Fake User Personas Integrity & Distribution', () => {
  const usersPath = resolve(process.cwd(), 'data/fake_users.json');
  const rawUsers = readFileSync(usersPath, 'utf-8');
  const users = JSON.parse(rawUsers);

  assert.equal(users.length, 40, 'There must be exactly 40 test users');

  const emails = new Set<string>();
  const ids = new Set<string>();

  for (const user of users) {
    // 1. Valid UUID v4
    assert.ok(isValidUuid(user.id), `User ${user.display_name} has invalid UUID: ${user.id}`);
    assert.ok(!ids.has(user.id), `Duplicate user id detected: ${user.id}`);
    ids.add(user.id);

    // 2. Valid email format and uniqueness
    assert.ok(user.email.includes('@'), `Invalid email for ${user.display_name}`);
    assert.ok(!emails.has(user.email), `Duplicate email detected: ${user.email}`);
    emails.add(user.email);

    // 3. Realistic metadata
    assert.ok(user.display_name.length > 2, 'Display name must not be empty');
    assert.ok(user.role, 'Role must be defined');
    assert.ok(user.sector, 'Sector must be defined');
    assert.ok(user.city && user.state, 'Location must be defined');
    assert.ok(['en', 'hi', 'or'].includes(user.preferred_language), 'Language must be en, hi, or or');
    assert.ok(user.sample_query.length > 10, 'Sample query must be a realistic prompt');
  }

  // Verify diversity of personas
  const roles = new Set(users.map((u: any) => u.role));
  assert.ok(roles.has('MSME Manufacturer'), 'Must contain MSME Manufacturers');
  assert.ok(roles.has('Quality Assurance Manager') || roles.has('Compliance Officer'), 'Must contain QA/Compliance Officers');
  assert.ok(roles.has('Consumer'), 'Must contain Consumers');
  assert.ok(roles.has('Academic Researcher') || roles.has('Engineering Student'), 'Must contain Researchers/Students');
});

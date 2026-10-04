import test from 'node:test';
import assert from 'node:assert/strict';
import { HealthService } from '../src/services.ts';
import { createInMemorySupabaseClient } from '../src/mock-db.ts';
import { MockAIServiceClient } from '../src/ai-client.ts';

test('Readiness Probe - returns ready when database and mock AI are available', async () => {
  const mockDb = createInMemorySupabaseClient();
  const mockAi = new MockAIServiceClient();
  const healthService = new HealthService(mockDb, mockAi);

  const result = await healthService.readiness();
  assert.equal(result.ready, true);
  assert.equal(result.status, 'ready');
  assert.equal(result.database, 'connected');
  assert.equal(result.ai_service, 'ready (mock)');
  assert.equal(result.version, '0.1.0');
});

test('Readiness Probe - reports degraded when AI healthcheck fails', async () => {
  const mockDb = createInMemorySupabaseClient();
  const failingAi = {
    async queryAssistant(): Promise<any> { throw new Error('Unhealthy'); },
    async healthCheck(): Promise<boolean> { return false; },
  };
  const healthService = new HealthService(mockDb, failingAi as any);

  const result = await healthService.readiness();
  assert.equal(result.ai_service, 'degraded');
});

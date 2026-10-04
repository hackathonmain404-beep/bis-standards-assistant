import test from 'node:test';
import assert from 'node:assert/strict';
import { AICircuitBreaker } from '../src/ai-client.ts';

test('AI Circuit Breaker - initial state is CLOSED and allows execution', () => {
  const breaker = new AICircuitBreaker({ failureThreshold: 3, cooldownPeriodMs: 100 });
  assert.equal(breaker.getState(), 'CLOSED');
  assert.equal(breaker.canExecute(), true);
});

test('AI Circuit Breaker - opens after reaching failure threshold', () => {
  const breaker = new AICircuitBreaker({ failureThreshold: 3, cooldownPeriodMs: 100 });

  breaker.recordFailure();
  assert.equal(breaker.getState(), 'CLOSED');
  assert.equal(breaker.canExecute(), true);

  breaker.recordFailure();
  assert.equal(breaker.getState(), 'CLOSED');

  breaker.recordFailure();
  assert.equal(breaker.getState(), 'OPEN');
  assert.equal(breaker.canExecute(), false, 'Breaker should reject execution when OPEN');
});

test('AI Circuit Breaker - transitions to HALF_OPEN after cooldown period', async () => {
  const breaker = new AICircuitBreaker({ failureThreshold: 2, cooldownPeriodMs: 50 });

  breaker.recordFailure();
  breaker.recordFailure();
  assert.equal(breaker.getState(), 'OPEN');

  await new Promise(resolve => setTimeout(resolve, 60));

  assert.equal(breaker.getState(), 'HALF_OPEN');
  assert.equal(breaker.canExecute(), true, 'HALF_OPEN allows a trial execution');
});

test('AI Circuit Breaker - recovers to CLOSED on success', () => {
  const breaker = new AICircuitBreaker({ failureThreshold: 2, cooldownPeriodMs: 50 });

  breaker.recordFailure();
  breaker.recordFailure();
  assert.equal(breaker.getState(), 'OPEN');

  breaker.recordSuccess();
  assert.equal(breaker.getState(), 'CLOSED');
  assert.equal(breaker.canExecute(), true);
});

test('AI Circuit Breaker - reset resets to CLOSED', () => {
  const breaker = new AICircuitBreaker({ failureThreshold: 1, cooldownPeriodMs: 5000 });
  breaker.recordFailure();
  assert.equal(breaker.getState(), 'OPEN');

  breaker.reset();
  assert.equal(breaker.getState(), 'CLOSED');
  assert.equal(breaker.canExecute(), true);
});

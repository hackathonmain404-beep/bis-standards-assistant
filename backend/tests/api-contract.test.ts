import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import server from '../src/server.ts';

// Start server on ephemeral port for integration testing
let testPort: number;
let baseUrl: string;

test.before(async () => {
  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const addr = server.address() as { port: number };
      testPort = addr.port;
      baseUrl = `http://127.0.0.1:${testPort}/api/v1`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

test('API Contract - GET /api/v1/health', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'application/json');
  assert.ok(res.headers.get('X-Request-ID'));

  const body = await res.json();
  assert.equal(body.status, 'healthy');
  assert.equal(body.version, '0.1.0');
  assert.equal(body.components.database, 'healthy');
  assert.equal(body.components.ai_service, 'healthy');
  assert.equal(body.components.vector_store, 'healthy');
});

test('API Contract - OPTIONS preflight handles CORS', async () => {
  const res = await fetch(`${baseUrl}/chat`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:3000',
    },
  });
  assert.equal(res.status, 204);
  assert.ok(res.headers.get('Access-Control-Allow-Origin'));
  assert.ok(res.headers.get('Access-Control-Allow-Methods'));
});

test('API Contract - POST /api/v1/chat success flow', async () => {
  const chatPayload = {
    message: 'Which standard applies to domestic electric steam irons?',
    language: 'en',
    client_request_id: 'e2e-test-req-1',
  };

  const res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': 'custom-req-id-1234',
    },
    body: JSON.stringify(chatPayload),
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get('X-Request-ID'), 'custom-req-id-1234');

  const body = await res.json();
  assert.ok(body.session_id, 'Must contain session_id');
  assert.ok(body.message_id, 'Must contain message_id');
  assert.ok(body.response, 'Must contain response object');
  assert.equal(typeof body.response.text, 'string');
  assert.equal(body.response.intent, 'PRODUCT_DISCOVERY');
  assert.ok(Array.isArray(body.response.citations), 'Citations must be array');
  assert.equal(body.response.needs_clarification, false);
  assert.ok(Array.isArray(body.response.follow_up_suggestions));
  assert.ok(body.metadata, 'Must contain metadata');
  assert.equal(typeof body.metadata.processing_time_ms, 'number');
});

test('API Contract - POST /api/v1/chat validation error on empty message', async () => {
  const res = await fetch(`${baseUrl}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: '   ' }),
  });

  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error.code, 'EMPTY_MESSAGE');
  assert.equal(body.error.message, 'Please enter a question to get started.');
});

test('API Contract - GET /api/v1/sessions pagination contract', async () => {
  const res = await fetch(`${baseUrl}/sessions?limit=10&offset=0`);
  assert.equal(res.status, 200);

  const body = await res.json();
  assert.ok(Array.isArray(body.sessions));
  assert.equal(typeof body.total, 'number');
  assert.equal(body.limit, 10);
  assert.equal(body.offset, 0);
});

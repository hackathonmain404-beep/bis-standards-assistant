import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAiServiceResponse } from '../src/ai-validator.ts';
import { AppError } from '../src/errors.ts';

test('AI Validator - validates compliant response', () => {
  const raw = {
    response_text: 'IS 14543 governs packaged drinking water.',
    intent: 'PRODUCT_DISCOVERY',
    citations: [
      {
        index: 1,
        standard_id: 'IS 14543:2016',
        document_title: 'Packaged Drinking Water',
        section: '1. Scope',
        clause: '1.1',
        snippet: 'Prescribes requirements for drinking water.',
        source_document_id: 'doc-14543',
      },
    ],
    needs_clarification: false,
    clarification_questions: [],
    follow_up_suggestions: ['What testing is needed?'],
    metadata: { chunks_retrieved: 4 },
  };

  const validated = validateAiServiceResponse(raw);
  assert.equal(validated.response_text, 'IS 14543 governs packaged drinking water.');
  assert.equal(validated.intent, 'PRODUCT_DISCOVERY');
  assert.equal(validated.citations.length, 1);
  assert.equal(validated.citations[0].standard_id, 'IS 14543:2016');
  assert.equal(validated.citations[0].index, 1);
  assert.equal(validated.needs_clarification, false);
  assert.deepEqual(validated.follow_up_suggestions, ['What testing is needed?']);
});

test('AI Validator - filters out corrupt/malformed citation items safely', () => {
  const raw = {
    response_text: 'Compliance response.',
    intent: 'STANDARD_QUERY',
    citations: [
      'corrupt string citation',
      null,
      {
        index: 1,
        standard_id: 'IS 302-1',
        snippet: 'Live parts protection.',
      },
    ],
    needs_clarification: false,
  };

  const validated = validateAiServiceResponse(raw);
  assert.equal(validated.citations.length, 1);
  assert.equal(validated.citations[0].standard_id, 'IS 302-1');
  assert.equal(validated.citations[0].snippet, 'Live parts protection.');
});

test('AI Validator - throws AppError.aiUnavailable on empty or missing response_text', () => {
  assert.throws(
    () => validateAiServiceResponse({ response_text: '' }),
    (err: AppError) => err.code === 'AI_SERVICE_UNAVAILABLE' && err.statusCode === 503
  );

  assert.throws(
    () => validateAiServiceResponse({ intent: 'GENERAL_BIS' }),
    (err: AppError) => err.code === 'AI_SERVICE_UNAVAILABLE' && err.statusCode === 503
  );
});

test('AI Validator - throws AppError.aiUnavailable on non-object payload', () => {
  assert.throws(
    () => validateAiServiceResponse('not-an-object'),
    (err: AppError) => err.code === 'AI_SERVICE_UNAVAILABLE' && err.statusCode === 503
  );

  assert.throws(
    () => validateAiServiceResponse(null),
    (err: AppError) => err.code === 'AI_SERVICE_UNAVAILABLE' && err.statusCode === 503
  );
});

test('AI Validator - defaults intent to GENERAL_BIS when missing', () => {
  const validated = validateAiServiceResponse({
    response_text: 'Generic response without intent.',
  });
  assert.equal(validated.intent, 'GENERAL_BIS');
  assert.deepEqual(validated.citations, []);
  assert.equal(validated.needs_clarification, false);
});

/**
 * Downstream AI Response Validator — BIS Intelligent Assistant Backend
 * Follows Section 18 & 19 of Master Implementation Prompt
 * Treats AI/RAG output as UNTRUSTED DOWNSTREAM DATA.
 */

import { AppError } from './errors.ts';
import { AIServiceResponse, CitationItem } from './types.ts';
import { Logger } from './logger.ts';

const logger = new Logger(undefined, 'ai-validator');

/**
 * Validates and sanitizes untrusted AI/RAG service responses.
 * Rejects corrupt payloads and filters malformed citations safely.
 */
export function validateAiServiceResponse(data: unknown): AIServiceResponse {
  if (!data || typeof data !== 'object') {
    logger.error('AI response is not an object', { details: { data } });
    throw AppError.aiUnavailable('Invalid response received from assistant engine.');
  }

  const raw = data as Record<string, unknown>;

  // 1. Validate response_text
  if (typeof raw.response_text !== 'string' || raw.response_text.trim().length === 0) {
    logger.error('AI response missing valid response_text', { details: { raw } });
    throw AppError.aiUnavailable('Assistant engine returned empty response content.');
  }

  // 2. Validate intent
  const intent = typeof raw.intent === 'string' && raw.intent.trim().length > 0
    ? raw.intent.trim()
    : 'GENERAL_BIS';

  // 3. Validate and sanitize citations
  const rawCitations = Array.isArray(raw.citations) ? raw.citations : [];
  const sanitizedCitations: CitationItem[] = [];

  for (let i = 0; i < rawCitations.length; i++) {
    const item = rawCitations[i];
    if (!item || typeof item !== 'object') {
      logger.warn(`Skipping malformed citation at index ${i}`, { details: { item } });
      continue;
    }

    const c = item as Record<string, unknown>;
    const index = typeof c.index === 'number' ? c.index : i + 1;
    const standardId = typeof c.standard_id === 'string' ? c.standard_id.trim() : null;
    const documentTitle = typeof c.document_title === 'string' ? c.document_title.trim() : null;
    const section = typeof c.section === 'string' ? c.section.trim() : null;
    const clause = typeof c.clause === 'string' ? c.clause.trim() : null;
    const snippet = typeof c.snippet === 'string' ? c.snippet.trim() : null;
    const sourceDocId = typeof c.source_document_id === 'string' ? c.source_document_id.trim() : null;

    sanitizedCitations.push({
      index,
      standard_id: standardId,
      document_title: documentTitle,
      section,
      clause,
      snippet,
      source_document_id: sourceDocId,
    });
  }

  // 4. Validate clarification flags and lists
  const needsClarification = Boolean(raw.needs_clarification);

  const clarificationQuestions: string[] = [];
  if (Array.isArray(raw.clarification_questions)) {
    for (const q of raw.clarification_questions) {
      if (typeof q === 'string' && q.trim().length > 0) {
        clarificationQuestions.push(q.trim());
      }
    }
  }

  const followUpSuggestions: string[] = [];
  if (Array.isArray(raw.follow_up_suggestions)) {
    for (const s of raw.follow_up_suggestions) {
      if (typeof s === 'string' && s.trim().length > 0) {
        followUpSuggestions.push(s.trim());
      }
    }
  }

  // 5. Metadata
  const metadata = typeof raw.metadata === 'object' && raw.metadata !== null
    ? (raw.metadata as Record<string, unknown>)
    : {};

  return {
    response_text: raw.response_text.trim(),
    intent,
    citations: sanitizedCitations,
    needs_clarification: needsClarification,
    clarification_questions: clarificationQuestions,
    follow_up_suggestions: followUpSuggestions,
    metadata,
  };
}

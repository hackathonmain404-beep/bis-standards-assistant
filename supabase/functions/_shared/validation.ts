/**
 * Input Validation Utilities — BIS Intelligent Assistant Backend
 * Enforces API_CONTRACT.md and SECURITY.md constraints
 */

import { AppError } from './errors.ts';
import { ChatRequest } from './types.ts';

// UUID v4 format regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Supported languages for MVP
const SUPPORTED_LANGUAGES = new Set(['en', 'hi']);

// Constraints
const MAX_MESSAGE_LENGTH = 5000;
const MAX_CLIENT_REQUEST_ID_LENGTH = 128;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Validates a UUID format
 */
export function isValidUuid(id: string): boolean {
  if (typeof id !== 'string') return false;
  return UUID_REGEX.test(id.trim());
}

/**
 * Sanitizes user input string: strips null bytes and excessive whitespace
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/\0/g, '').trim();
}

/**
 * Validates and normalizes ChatRequest payload
 */
export function validateChatRequest(body: unknown): ChatRequest {
  if (!body || typeof body !== 'object') {
    throw AppError.invalidRequest('Request body must be a valid JSON object.');
  }

  const raw = body as Record<string, unknown>;

  // 1. Message validation
  if (typeof raw.message !== 'string') {
    throw AppError.emptyMessage('Please enter a question to get started.');
  }

  const sanitizedMessage = sanitizeString(raw.message);
  if (sanitizedMessage.length === 0) {
    throw AppError.emptyMessage('Please enter a question to get started.');
  }

  if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
    throw AppError.invalidRequest(
      `Message exceeds maximum permitted length of ${MAX_MESSAGE_LENGTH} characters.`,
      { max_length: MAX_MESSAGE_LENGTH, current_length: sanitizedMessage.length }
    );
  }

  // 2. Session ID validation (if provided)
  let sessionId: string | null = null;
  if (raw.session_id !== undefined && raw.session_id !== null) {
    if (typeof raw.session_id !== 'string' || !isValidUuid(raw.session_id)) {
      throw AppError.invalidRequest('Invalid session_id format. Must be a valid UUID v4.', {
        session_id: raw.session_id,
      });
    }
    sessionId = raw.session_id.trim();
  }

  // 3. Language validation (default: 'en')
  let language = 'en';
  if (raw.language !== undefined && raw.language !== null) {
    if (typeof raw.language !== 'string') {
      throw AppError.invalidRequest('Language must be a string code (e.g. en, hi).');
    }
    const normalizedLang = raw.language.trim().toLowerCase();
    if (!SUPPORTED_LANGUAGES.has(normalizedLang)) {
      throw AppError.unsupportedLanguage(normalizedLang);
    }
    language = normalizedLang;
  }

  // 4. Client Request ID (for idempotency, optional)
  let clientRequestId: string | null = null;
  if (raw.client_request_id !== undefined && raw.client_request_id !== null) {
    if (typeof raw.client_request_id === 'string') {
      const sanitizedId = sanitizeString(raw.client_request_id);
      if (sanitizedId.length <= MAX_CLIENT_REQUEST_ID_LENGTH) {
        clientRequestId = sanitizedId;
      }
    }
  }

  return {
    session_id: sessionId,
    message: sanitizedMessage,
    language,
    client_request_id: clientRequestId,
  };
}

/**
 * Validates pagination parameters
 */
export function validatePagination(url: URL): { limit: number; offset: number } {
  const limitParam = url.searchParams.get('limit');
  const offsetParam = url.searchParams.get('offset');

  let limit = DEFAULT_LIMIT;
  let offset = 0;

  if (limitParam !== null) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      throw AppError.invalidRequest("Parameter 'limit' must be an integer between 1 and 100.");
    }
    limit = Math.min(parsedLimit, MAX_LIMIT);
  }

  if (offsetParam !== null) {
    const parsedOffset = parseInt(offsetParam, 10);
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      throw AppError.invalidRequest("Parameter 'offset' must be a non-negative integer.");
    }
    offset = parsedOffset;
  }

  return { limit, offset };
}

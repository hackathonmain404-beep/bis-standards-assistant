/**
 * Standard Error Framework — BIS Intelligent Assistant Backend
 * Follows API_CONTRACT.md and ERROR_HANDLING.md
 */

import type { ErrorResponse } from './types.ts';

export type ErrorCode =
  | 'INVALID_REQUEST'
  | 'EMPTY_MESSAGE'
  | 'UNSUPPORTED_LANGUAGE'
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'SESSION_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'AI_SERVICE_UNAVAILABLE'
  | 'LLM_ERROR'
  | 'RETRIEVAL_ERROR'
  | 'TIMEOUT';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static invalidRequest(message = 'Please enter a valid request.', details?: Record<string, unknown>): AppError {
    return new AppError('INVALID_REQUEST', message, 400, details);
  }

  static emptyMessage(message = 'Please enter a question to get started.'): AppError {
    return new AppError('EMPTY_MESSAGE', message, 400);
  }

  static unsupportedLanguage(language: string): AppError {
    return new AppError(
      'UNSUPPORTED_LANGUAGE',
      `Language '${language}' is not currently supported. Please try English or Hindi.`,
      400,
      { requested_language: language }
    );
  }

  static authRequired(message = 'Authentication is required for this operation.'): AppError {
    return new AppError('AUTH_REQUIRED', message, 401);
  }

  static forbidden(message = 'You do not have permission to access this resource.'): AppError {
    return new AppError('FORBIDDEN', message, 403);
  }

  static sessionNotFound(sessionId: string): AppError {
    return new AppError('SESSION_NOT_FOUND', 'This conversation could not be found.', 404, {
      session_id: sessionId,
    });
  }

  static rateLimited(retryAfterSeconds = 60): AppError {
    return new AppError(
      'RATE_LIMITED',
      "You're sending too many requests. Please wait a moment before trying again.",
      429,
      { retry_after_seconds: retryAfterSeconds }
    );
  }

  static internal(message = 'Something went wrong on our end. Please try again.', details?: Record<string, unknown>): AppError {
    return new AppError('INTERNAL_ERROR', message, 500, details);
  }

  static aiUnavailable(message = 'One of our services is temporarily unavailable. Please try again in a moment.'): AppError {
    return new AppError('AI_SERVICE_UNAVAILABLE', message, 503);
  }

  static timeout(message = 'Your request took too long to process. Please try again or simplify your question.'): AppError {
    return new AppError('TIMEOUT', message, 504);
  }
}

/**
 * Builds a standardized ErrorResponse object and HTTP Response
 */
export function formatErrorResponse(
  error: unknown,
  requestId: string,
  corsHeaders: Record<string, string> = {}
): Response {
  let statusCode = 500;
  let code: ErrorCode = 'INTERNAL_ERROR';
  let message = 'Something went wrong on our end. Please try again.';
  let details: Record<string, unknown> | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      statusCode = 503;
      code = 'AI_SERVICE_UNAVAILABLE';
      message = 'One of our services is temporarily unavailable. Please try again in a moment.';
    } else if (error.name === 'AbortError' || error.message.includes('timeout')) {
      statusCode = 504;
      code = 'TIMEOUT';
      message = 'Your request took too long to process. Please try again or simplify your question.';
    }
  }

  const responseBody: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      request_id: requestId,
      ...(details ? { details } : {}),
    },
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
    ...corsHeaders,
  };

  if (code === 'RATE_LIMITED' && details?.retry_after_seconds) {
    headers['Retry-After'] = String(details.retry_after_seconds);
  }

  return new Response(JSON.stringify(responseBody), {
    status: statusCode,
    headers,
  });
}

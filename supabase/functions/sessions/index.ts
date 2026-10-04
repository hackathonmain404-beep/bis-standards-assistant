/// <reference path="../deno.d.ts" />
/**
 * Sessions Edge Function — BIS Intelligent Assistant Backend
 * Implements:
 *   GET    /api/v1/sessions
 *   GET    /api/v1/sessions/:id
 *   DELETE /api/v1/sessions/:id
 * Follows API_CONTRACT.md Sections 2, 3, 4
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, getCorsHeaders } from '../_shared/cors.ts';
import { getOrCreateRequestId } from '../_shared/request-id.ts';
import { formatErrorResponse, AppError } from '../_shared/errors.ts';
import { validatePagination, isValidUuid } from '../_shared/validation.ts';
import { generalRateLimiter, getClientIdentifier } from '../_shared/rate-limiter.ts';
import { createServerClient } from '../_shared/supabase-client.ts';
import { getAuthenticatedUser } from '../_shared/auth.ts';
import { ConversationService } from '../_shared/services.ts';
import { Logger } from '../_shared/logger.ts';

serve(async (req: Request) => {
  const corsPreflight = handleCorsPreflight(req);
  if (corsPreflight) return corsPreflight;

  const requestId = getOrCreateRequestId(req);
  const corsHeaders = getCorsHeaders(req);
  const url = new URL(req.url);
  const logger = new Logger(requestId, url.pathname);

  try {
    // 1. Rate limit check
    const clientId = getClientIdentifier(req);
    generalRateLimiter.check(clientId);

    // 2. Identify session ID from path if present (e.g. /sessions/uuid)
    const pathParts = url.pathname.split('/').filter(Boolean);
    const lastPart = pathParts[pathParts.length - 1];
    const isIdInPath = lastPart && lastPart !== 'sessions' && lastPart !== 'v1';
    const sessionId = isIdInPath ? lastPart : null;

    if (sessionId && !isValidUuid(sessionId)) {
      throw AppError.invalidRequest('Invalid session ID format in URL. Must be a valid UUID.', {
        session_id: sessionId,
      });
    }

    const supabase = createServerClient();
    const caller = await getAuthenticatedUser(req, supabase);
    const conversationService = new ConversationService(supabase);

    // 3. Dispatch based on method and path
    if (req.method === 'GET' && !sessionId) {
      // GET /sessions — List sessions
      const { limit, offset } = validatePagination(url);
      const result = await conversationService.listSessions(caller, limit, offset);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
      });
    }

    if (req.method === 'GET' && sessionId) {
      // GET /sessions/:id — Get session history
      const result = await conversationService.getSessionHistory(sessionId, caller);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
      });
    }

    if (req.method === 'DELETE' && sessionId) {
      // DELETE /sessions/:id — Delete session
      const result = await conversationService.deleteSession(sessionId, caller);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
      });
    }

    throw new AppError('INVALID_REQUEST', `Unsupported method ${req.method} or route pattern.`, 405);
  } catch (error) {
    logger.error('Sessions endpoint error', {
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    return formatErrorResponse(error, requestId, corsHeaders);
  }
});

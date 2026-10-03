/// <reference path="../deno.d.ts" />
/**
 * Unified API v1 Gateway Edge Function — BIS Intelligent Assistant Backend
 * Routes:
 *   POST   /api/v1/chat
 *   GET    /api/v1/sessions
 *   GET    /api/v1/sessions/:id
 *   DELETE /api/v1/sessions/:id
 *   GET    /api/v1/health
 * Follows API_CONTRACT.md base URL /api/v1 conventions
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, getCorsHeaders } from '../_shared/cors.ts';
import { getOrCreateRequestId } from '../_shared/request-id.ts';
import { formatErrorResponse, AppError } from '../_shared/errors.ts';
import { validateChatRequest, validatePagination, isValidUuid } from '../_shared/validation.ts';
import { chatRateLimiter, generalRateLimiter, getClientIdentifier } from '../_shared/rate-limiter.ts';
import { createServerClient } from '../_shared/supabase-client.ts';
import { getAuthenticatedUser } from '../_shared/auth.ts';
import { getBackendConfig } from '../_shared/config.ts';
import { getAiServiceClient } from '../_shared/ai-client.ts';
import { AssistantQueryService, ConversationService, HealthService } from '../_shared/services.ts';
import { Logger } from '../_shared/logger.ts';

serve(async (req: Request) => {
  const corsPreflight = handleCorsPreflight(req);
  if (corsPreflight) return corsPreflight;

  const requestId = getOrCreateRequestId(req);
  const corsHeaders = getCorsHeaders(req);
  const url = new URL(req.url);
  const logger = new Logger(requestId, url.pathname);

  try {
    const supabase = createServerClient();
    const caller = await getAuthenticatedUser(req, supabase);
    const config = getBackendConfig();
    const aiClient = getAiServiceClient(config);

    // Normalize path by removing prefixes such as /v1 or /api/v1 or /functions/v1/v1
    const cleanPath = url.pathname
      .replace(/^\/functions\/v1\/v1/, '')
      .replace(/^\/functions\/v1/, '')
      .replace(/^\/api\/v1/, '')
      .replace(/^\/v1/, '') || '/';

    const segments = cleanPath.split('/').filter(Boolean);
    const rootRoute = segments[0] || '';

    // Route: /health
    if (rootRoute === 'health') {
      if (req.method !== 'GET') {
        throw new AppError('INVALID_REQUEST', 'Method not allowed for /health. Use GET.', 405);
      }
      const healthService = new HealthService(supabase, aiClient);
      const health = await healthService.check();
      return new Response(JSON.stringify(health), {
        status: health.status === 'unhealthy' ? 503 : 200,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
      });
    }

    // Route: /chat
    if (rootRoute === 'chat') {
      if (req.method !== 'POST') {
        throw new AppError('INVALID_REQUEST', 'Method not allowed for /chat. Use POST.', 405);
      }
      chatRateLimiter.check(getClientIdentifier(req));

      let rawBody: unknown;
      try {
        rawBody = await req.json();
      } catch {
        throw AppError.invalidRequest('Request body must be valid JSON.');
      }

      const chatReq = validateChatRequest(rawBody);
      const assistantService = new AssistantQueryService(supabase, aiClient);
      const response = await assistantService.processChat(chatReq, caller, requestId);

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
      });
    }

    // Route: /sessions or /sessions/:id
    if (rootRoute === 'sessions') {
      generalRateLimiter.check(getClientIdentifier(req));
      const conversationService = new ConversationService(supabase);
      const sessionId = segments[1] || null;

      if (sessionId && !isValidUuid(sessionId)) {
        throw AppError.invalidRequest('Invalid session ID format. Must be a valid UUID.', { session_id: sessionId });
      }

      if (req.method === 'GET' && !sessionId) {
        const { limit, offset } = validatePagination(url);
        const result = await conversationService.listSessions(caller, limit, offset);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
        });
      }

      if (req.method === 'GET' && sessionId) {
        const result = await conversationService.getSessionHistory(sessionId, caller);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
        });
      }

      if (req.method === 'DELETE' && sessionId) {
        const result = await conversationService.deleteSession(sessionId, caller);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Request-ID': requestId, ...corsHeaders },
        });
      }

      throw new AppError('INVALID_REQUEST', `Unsupported method ${req.method} for sessions.`, 405);
    }

    throw new AppError('INVALID_REQUEST', `Endpoint ${url.pathname} not found.`, 404);
  } catch (error) {
    logger.error('Gateway request failed', {
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    return formatErrorResponse(error, requestId, corsHeaders);
  }
});

/**
 * Chat Edge Function — BIS Intelligent Assistant Backend
 * Implements: POST /api/v1/chat
 * Follows Section 62 & 63 of Master Implementation Prompt
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, getCorsHeaders } from '../_shared/cors.ts';
import { getOrCreateRequestId } from '../_shared/request-id.ts';
import { formatErrorResponse, AppError } from '../_shared/errors.ts';
import { validateChatRequest } from '../_shared/validation.ts';
import { chatRateLimiter, getClientIdentifier } from '../_shared/rate-limiter.ts';
import { createServerClient } from '../_shared/supabase-client.ts';
import { getAuthenticatedUser } from '../_shared/auth.ts';
import { getBackendConfig } from '../_shared/config.ts';
import { getAiServiceClient } from '../_shared/ai-client.ts';
import { AssistantQueryService } from '../_shared/services.ts';
import { Logger } from '../_shared/logger.ts';

serve(async (req: Request) => {
  const corsPreflight = handleCorsPreflight(req);
  if (corsPreflight) return corsPreflight;

  const requestId = getOrCreateRequestId(req);
  const corsHeaders = getCorsHeaders(req);
  const logger = new Logger(requestId, '/api/v1/chat');

  if (req.method !== 'POST') {
    return formatErrorResponse(
      new AppError('INVALID_REQUEST', `Method ${req.method} is not allowed. Use POST.`, 405),
      requestId,
      corsHeaders
    );
  }

  try {
    // 1. Rate limiting check
    const clientId = getClientIdentifier(req);
    chatRateLimiter.check(clientId);

    // 2. Parse & validate JSON body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      throw AppError.invalidRequest('Request body must be valid JSON.');
    }

    const chatReq = validateChatRequest(rawBody);

    // 3. Authenticate caller (optional for guest sessions)
    const supabase = createServerClient();
    const caller = await getAuthenticatedUser(req, supabase);

    // 4. Instantiate service layer
    const config = getBackendConfig();
    const aiClient = getAiServiceClient(config);
    const assistantService = new AssistantQueryService(supabase, aiClient);

    // 5. Execute chat query
    logger.info('Processing assistant chat query', {
      method: req.method,
      details: {
        session_id: chatReq.session_id,
        message_length: chatReq.message.length,
        language: chatReq.language,
      },
    });

    const response = await assistantService.processChat(chatReq, caller, requestId);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...corsHeaders,
      },
    });
  } catch (error) {
    logger.error('Chat endpoint error', {
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    return formatErrorResponse(error, requestId, corsHeaders);
  }
});

/**
 * Local Development Server — BIS Intelligent Assistant Backend
 * Provides standalone HTTP execution on port 8000 per ENV_CONFIG.md
 * Implements exact same API contracts and routing as Supabase Edge Functions
 */

import http from 'node:http';
import { handleCorsPreflight, getCorsHeaders } from './cors.ts';
import { getOrCreateRequestId } from './request-id.ts';
import { formatErrorResponse, AppError } from './errors.ts';
import { validateChatRequest, validatePagination, isValidUuid } from './validation.ts';
import { chatRateLimiter, generalRateLimiter, getClientIdentifier } from './rate-limiter.ts';
import { createServerClient } from './supabase-client.ts';
import { getAuthenticatedUser } from './auth.ts';
import { getBackendConfig } from './config.ts';
import { getAiServiceClient } from './ai-client.ts';
import { AssistantQueryService, ConversationService, HealthService } from './services.ts';
import { Logger } from './logger.ts';

const config = getBackendConfig();
const supabase = createServerClient();
const aiClient = getAiServiceClient(config);

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${config.port}`;
  const fullUrl = new URL(req.url || '/', `http://${host}`);
  const standardReq = new Request(fullUrl.toString(), {
    method: req.method,
    headers: req.headers as HeadersInit,
  });

  const corsPreflight = handleCorsPreflight(standardReq);
  if (corsPreflight) {
    res.writeHead(corsPreflight.status, Object.fromEntries(corsPreflight.headers.entries()));
    res.end();
    return;
  }

  const requestId = getOrCreateRequestId(standardReq);
  const corsHeaders = getCorsHeaders(standardReq);
  const logger = new Logger(requestId, fullUrl.pathname);

  try {
    const caller = await getAuthenticatedUser(standardReq, supabase);

    // Normalize path: strip /api/v1 prefix
    const path = fullUrl.pathname.replace(/^\/api\/v1/, '').replace(/^\/v1/, '') || '/';
    const segments = path.split('/').filter(Boolean);
    const rootRoute = segments[0] || '';

    // Route: /health
    if (rootRoute === 'health') {
      if (req.method !== 'GET') {
        throw new AppError('INVALID_REQUEST', 'Method not allowed for /health. Use GET.', 405);
      }
      const healthService = new HealthService(supabase, aiClient);
      const health = await healthService.check();

      res.writeHead(health.status === 'unhealthy' ? 503 : 200, {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...corsHeaders,
      });
      res.end(JSON.stringify(health));
      return;
    }

    // Route: /ready
    if (rootRoute === 'ready') {
      if (req.method !== 'GET') {
        throw new AppError('INVALID_REQUEST', 'Method not allowed for /ready. Use GET.', 405);
      }
      const healthService = new HealthService(supabase, aiClient);
      const readiness = await healthService.readiness();

      res.writeHead(readiness.ready ? 200 : 503, {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...corsHeaders,
      });
      res.end(JSON.stringify(readiness));
      return;
    }

    // Route: /chat
    if (rootRoute === 'chat') {
      if (req.method !== 'POST') {
        throw new AppError('INVALID_REQUEST', 'Method not allowed for /chat. Use POST.', 405);
      }
      chatRateLimiter.check(getClientIdentifier(standardReq));

      const rawBody = await readJsonBody(req);
      const chatReq = validateChatRequest(rawBody);

      const assistantService = new AssistantQueryService(supabase, aiClient);
      const response = await assistantService.processChat(chatReq, caller, requestId);

      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...corsHeaders,
      });
      res.end(JSON.stringify(response));
      return;
    }

    // Route: /sessions
    if (rootRoute === 'sessions') {
      generalRateLimiter.check(getClientIdentifier(standardReq));
      const conversationService = new ConversationService(supabase);
      const sessionId = segments[1] || null;

      if (sessionId && !isValidUuid(sessionId)) {
        throw AppError.invalidRequest('Invalid session ID format in URL.', { session_id: sessionId });
      }

      if (req.method === 'GET' && !sessionId) {
        const { limit, offset } = validatePagination(fullUrl);
        const result = await conversationService.listSessions(caller, limit, offset);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...corsHeaders,
        });
        res.end(JSON.stringify(result));
        return;
      }

      if (req.method === 'GET' && sessionId) {
        const result = await conversationService.getSessionHistory(sessionId, caller);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...corsHeaders,
        });
        res.end(JSON.stringify(result));
        return;
      }

      if (req.method === 'DELETE' && sessionId) {
        const result = await conversationService.deleteSession(sessionId, caller);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
          ...corsHeaders,
        });
        res.end(JSON.stringify(result));
        return;
      }

      throw new AppError('INVALID_REQUEST', `Unsupported method ${req.method} for sessions.`, 405);
    }

    throw new AppError('INVALID_REQUEST', `Endpoint ${fullUrl.pathname} not found.`, 404);
  } catch (error) {
    logger.error('Request failed', {
      details: { error: error instanceof Error ? error.message : String(error) },
    });
    const errorResponse = formatErrorResponse(error, requestId, corsHeaders);
    res.writeHead(errorResponse.status, Object.fromEntries(errorResponse.headers.entries()));
    const bodyText = await errorResponse.text();
    res.end(bodyText);
  }
});

function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        // Reject payloads > 1MB
        reject(AppError.invalidRequest('Request payload too large.'));
      }
    });
    req.on('end', () => {
      try {
        if (!body.trim()) {
          reject(AppError.invalidRequest('Request body cannot be empty.'));
          return;
        }
        resolve(JSON.parse(body));
      } catch {
        reject(AppError.invalidRequest('Malformed JSON in request body.'));
      }
    });
    req.on('error', err => reject(err));
  });
}

const isDirectRun = process.argv[1] && (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js'));
if (isDirectRun) {
  server.listen(config.port, () => {
    console.log(`[BIS Intelligent Assistant] Backend Server running on http://localhost:${config.port}`);
    console.log(`API Base URL: http://localhost:${config.port}/api/v1`);
    console.log(`AI Mock Mode: ${config.aiMockMode}`);
  });
}

export default server;

/**
 * Health Check Edge Function — BIS Intelligent Assistant Backend
 * Implements: GET /api/v1/health
 * Follows API_CONTRACT.md Section 5 and Master Spec Section 92
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCorsPreflight, getCorsHeaders } from '../_shared/cors.ts';
import { getOrCreateRequestId } from '../_shared/request-id.ts';
import { formatErrorResponse } from '../_shared/errors.ts';
import { createServerClient } from '../_shared/supabase-client.ts';
import { getBackendConfig } from '../_shared/config.ts';
import { getAiServiceClient } from '../_shared/ai-client.ts';
import { HealthService } from '../_shared/services.ts';

serve(async (req: Request) => {
  const corsPreflight = handleCorsPreflight(req);
  if (corsPreflight) return corsPreflight;

  const requestId = getOrCreateRequestId(req);
  const corsHeaders = getCorsHeaders(req);

  try {
    const supabase = createServerClient();
    const config = getBackendConfig();
    const aiClient = getAiServiceClient(config);
    const healthService = new HealthService(supabase, aiClient);

    const health = await healthService.check();

    const statusCode = health.status === 'unhealthy' ? 503 : 200;

    return new Response(JSON.stringify(health), {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        ...corsHeaders,
      },
    });
  } catch (error) {
    return formatErrorResponse(error, requestId, corsHeaders);
  }
});

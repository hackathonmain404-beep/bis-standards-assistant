/**
 * CORS Security Utilities — BIS Intelligent Assistant Backend
 * Follows docs/api/SECURITY.md Section 12
 */

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin') || '';
  const allowedOriginsEnv = Deno.env.get('CORS_ALLOWED_ORIGINS') || 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173';
  const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim());

  let matchedOrigin = allowedOrigins[0] || 'http://localhost:3000';
  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    matchedOrigin = origin || matchedOrigin;
  }

  return {
    'Access-Control-Allow-Origin': matchedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Request-ID, Apikey, x-client-info',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCorsPreflight(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }
  return null;
}

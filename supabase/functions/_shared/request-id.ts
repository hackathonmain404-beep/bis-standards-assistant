/**
 * Request ID Extraction and Propagation — BIS Intelligent Assistant Backend
 * Enforces Section 40: Request ID / Correlation
 */

export function getOrCreateRequestId(request: Request): string {
  const incomingId = request.headers.get('x-request-id') || request.headers.get('X-Request-ID');
  if (incomingId && incomingId.trim().length > 0) {
    return incomingId.trim();
  }
  return crypto.randomUUID();
}

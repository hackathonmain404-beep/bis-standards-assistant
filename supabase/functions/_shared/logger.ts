/**
 * Structured Logging Utility — BIS Intelligent Assistant Backend
 * Follows docs/api/ERROR_HANDLING.md and Section 41 of Master Spec
 * CRITICAL RULE: Never log secrets, tokens, passwords, or full sensitive PII.
 */

const SENSITIVE_KEYS = new Set([
  'authorization',
  'token',
  'access_token',
  'refresh_token',
  'apikey',
  'api_key',
  'secret',
  'service_role_key',
  'password',
  'supabase_key',
]);

function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export interface LogEntry {
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  timestamp: string;
  request_id?: string;
  endpoint?: string;
  method?: string;
  status_code?: number;
  duration_ms?: number;
  message: string;
  error_code?: string;
  details?: unknown;
}

export class Logger {
  private requestId?: string;
  private endpoint?: string;

  constructor(requestId?: string, endpoint?: string) {
    this.requestId = requestId;
    this.endpoint = endpoint;
  }

  private emit(level: LogEntry['level'], message: string, meta?: Partial<LogEntry>) {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      request_id: meta?.request_id || this.requestId,
      endpoint: meta?.endpoint || this.endpoint,
      method: meta?.method,
      status_code: meta?.status_code,
      duration_ms: meta?.duration_ms,
      error_code: meta?.error_code,
      message,
      details: meta?.details ? redactSensitiveData(meta.details) : undefined,
    };

    const serialized = JSON.stringify(entry);
    if (level === 'ERROR') {
      console.error(serialized);
    } else if (level === 'WARN') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }

  info(message: string, meta?: Partial<LogEntry>) {
    this.emit('INFO', message, meta);
  }

  warn(message: string, meta?: Partial<LogEntry>) {
    this.emit('WARN', message, meta);
  }

  error(message: string, meta?: Partial<LogEntry>) {
    this.emit('ERROR', message, meta);
  }

  debug(message: string, meta?: Partial<LogEntry>) {
    const logLevel = Deno?.env?.get?.('LOG_LEVEL') || 'INFO';
    if (logLevel === 'DEBUG') {
      this.emit('DEBUG', message, meta);
    }
  }
}

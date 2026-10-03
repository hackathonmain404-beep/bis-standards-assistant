/**
 * Environment Configuration and Validation — BIS Intelligent Assistant Backend
 * Follows docs/api/ENV_CONFIG.md and Section 53/93 of Master Spec
 */

export interface BackendConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  aiServiceUrl: string;
  aiServiceKey: string;
  aiMockMode: boolean;
  aiTimeoutMs: number;
  corsAllowedOrigins: string;
  logLevel: string;
  port: number;
}

export function getBackendConfig(): BackendConfig {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile();
    } catch {
      // .env file absent or already loaded
    }
  }

  const envGet = (key: string): string => {
    return process.env[key] || '';
  };

  let rawSupabaseUrl = envGet('SUPABASE_URL') || 'http://127.0.0.1:54321';
  rawSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  const supabaseUrl = rawSupabaseUrl;
  const supabaseAnonKey = envGet('SUPABASE_ANON_KEY') || envGet('SUPABASE_PUBLIC_CLIENT_KEY') || 'mock-anon-key';
  const supabaseServiceRoleKey = envGet('SUPABASE_SERVICE_ROLE_KEY') || envGet('SUPABASE_SERVER_SECRET') || 'mock-service-role-key';
  const aiServiceUrl = envGet('AI_SERVICE_URL') || 'http://127.0.0.1:8001';
  const aiServiceKey = envGet('AI_SERVICE_KEY') || envGet('AI_SERVICE_SECRET') || '';
  const aiMockModeStr = envGet('AI_MOCK_MODE');
  const aiMockMode = aiMockModeStr ? aiMockModeStr.toLowerCase() === 'true' : true;
  const aiTimeoutMs = parseInt(envGet('AI_TIMEOUT_MS') || '30000', 10);
  const corsAllowedOrigins = envGet('CORS_ALLOWED_ORIGINS') || 'http://localhost:3000,http://localhost:5173';
  const logLevel = envGet('LOG_LEVEL') || 'INFO';
  const port = parseInt(envGet('APP_PORT') || '8000', 10);

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    aiServiceUrl,
    aiServiceKey,
    aiMockMode,
    aiTimeoutMs: isNaN(aiTimeoutMs) ? 30000 : aiTimeoutMs,
    corsAllowedOrigins,
    logLevel,
    port: isNaN(port) ? 8000 : port,
  };
}

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
  environment: string;
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

  const environment = envGet('NODE_ENV') || 'development';

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
  const corsAllowedOrigins = envGet('ALLOWED_ORIGINS') || envGet('CORS_ALLOWED_ORIGINS') || 'http://localhost:3000,http://localhost:5173';
  const logLevel = envGet('LOG_LEVEL') || 'INFO';
  const port = parseInt(envGet('PORT') || envGet('APP_PORT') || '8000', 10);

  const config: BackendConfig = {
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
    environment,
  };

  if (environment === 'production') {
    if (!config.supabaseUrl || config.supabaseUrl.includes('127.0.0.1') || config.supabaseUrl.includes('mock')) {
      throw new Error('[FATAL] SUPABASE_URL must be configured with a valid remote URL in production.');
    }
    if (!config.supabaseAnonKey || config.supabaseAnonKey === 'mock-anon-key') {
      throw new Error('[FATAL] SUPABASE_ANON_KEY must be provided in production.');
    }
    if (!config.supabaseServiceRoleKey || config.supabaseServiceRoleKey === 'mock-service-role-key') {
      throw new Error('[FATAL] SUPABASE_SERVICE_ROLE_KEY must be provided in production.');
    }
  }

  return config;
}

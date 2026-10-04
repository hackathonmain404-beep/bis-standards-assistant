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
}

export function getBackendConfig(): BackendConfig {
  const envGet = (key: string): string => {
    try {
      if (typeof Deno !== 'undefined' && Deno.env) {
        return Deno.env.get(key) || '';
      }
      if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || '';
      }
    } catch {
      // Return empty string on access restriction
    }
    return '';
  };

  const supabaseUrl = envGet('SUPABASE_URL') || 'http://127.0.0.1:54321';
  const supabaseAnonKey = envGet('SUPABASE_ANON_KEY') || envGet('SUPABASE_PUBLIC_CLIENT_KEY') || 'mock-anon-key';
  const supabaseServiceRoleKey = envGet('SUPABASE_SERVICE_ROLE_KEY') || envGet('SUPABASE_SERVER_SECRET') || 'mock-service-role-key';
  const aiServiceUrl = envGet('AI_SERVICE_URL') || 'http://127.0.0.1:8001';
  const aiServiceKey = envGet('AI_SERVICE_KEY') || envGet('AI_SERVICE_SECRET') || '';
  const aiMockModeStr = envGet('AI_MOCK_MODE');
  const aiMockMode = aiMockModeStr ? aiMockModeStr.toLowerCase() === 'true' : true; // Default to mock mode for safety
  const aiTimeoutMs = parseInt(envGet('AI_TIMEOUT_MS') || '30000', 10);
  const corsAllowedOrigins = envGet('CORS_ALLOWED_ORIGINS') || 'http://localhost:3000,http://localhost:5173';
  const logLevel = envGet('LOG_LEVEL') || 'INFO';

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
  };
}

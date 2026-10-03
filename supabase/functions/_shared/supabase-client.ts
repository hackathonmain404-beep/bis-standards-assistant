/// <reference path="../deno.d.ts" />
/**
 * Supabase Client Factory — BIS Intelligent Assistant Backend
 * Follows Section 5 & 6: Separation of User-Scoped Client and Privileged Server Client
 */

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { getBackendConfig } from './config.ts';

/**
 * Creates a user-scoped Supabase client that runs under the identity of the incoming user
 * and is therefore strictly governed by Row Level Security (RLS) policies.
 */
export function createUserClient(authToken?: string | null): SupabaseClient {
  const config = getBackendConfig();
  const headers: Record<string, string> = {};

  if (authToken && authToken.startsWith('Bearer ')) {
    headers['Authorization'] = authToken;
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers,
    },
  });
}

/**
 * Creates a privileged service-role Supabase client for administrative/orchestration tasks.
 * IMPORTANT: This client BYPASSES Row Level Security.
 * It must ONLY be used on the server after performing explicit authorization checks.
 */
export function createServerClient(): SupabaseClient {
  const config = getBackendConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

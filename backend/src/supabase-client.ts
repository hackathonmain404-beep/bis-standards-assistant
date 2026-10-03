/**
 * Supabase Client Factory — BIS Intelligent Assistant Backend
 * Follows Section 5 & 6: Separation of User-Scoped Client and Privileged Server Client
 */

import process from 'node:process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getBackendConfig } from './config.ts';
import { createInMemorySupabaseClient } from './mock-db.ts';

let inMemoryClient: any = null;

export function createUserClient(authToken?: string | null): SupabaseClient {
  const config = getBackendConfig();
  const isMock = process.env.SUPABASE_MOCK === 'true' || (!process.env.SUPABASE_URL && !config.supabaseAnonKey);

  if (isMock) {
    if (!inMemoryClient) {
      inMemoryClient = createInMemorySupabaseClient();
    }
    return inMemoryClient as SupabaseClient;
  }

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

export function createServerClient(forceMock = false): SupabaseClient {
  const config = getBackendConfig();
  const isMock = forceMock || process.env.SUPABASE_MOCK === 'true' || (!process.env.SUPABASE_URL);

  if (isMock) {
    if (!inMemoryClient) {
      inMemoryClient = createInMemorySupabaseClient();
    }
    return inMemoryClient as SupabaseClient;
  }

  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

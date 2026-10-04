/**
 * Supabase Client Factory — BIS Intelligent Assistant Backend
 * Follows Section 5 & 6: Separation of User-Scoped Client and Privileged Server Client
 */

import process from 'node:process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getBackendConfig } from './config.ts';
import { createInMemorySupabaseClient } from './mock-db.ts';

let inMemoryClient: any = null;

/**
 * Creates a User-Scoped Supabase Client.
 *
 * MANDATORY FOR USER DATA ACCESS:
 * - Sessions, Messages, Citations, Bookmarks/Saved Items
 * - Uses the user's JWT to enforce PostgreSQL Row Level Security (RLS).
 * - If User A tries to query User B's rows, PostgreSQL returns empty or denies access.
 */
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
  if (authToken) {
    const formattedToken = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken.trim()}`;
    headers['Authorization'] = formattedToken;
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
 * Convenience helper to get a User-Scoped Client directly from an incoming HTTP Request.
 */
export function getUserScopedClient(requestOrToken?: Request | string | null): SupabaseClient {
  if (!requestOrToken) {
    return createUserClient(null);
  }
  if (typeof requestOrToken === 'string') {
    return createUserClient(requestOrToken);
  }
  const authHeader = requestOrToken.headers.get('authorization') || requestOrToken.headers.get('Authorization');
  return createUserClient(authHeader);
}

/**
 * Creates a Privileged Server-Side Supabase Client.
 *
 * RESTRICTED USE ONLY:
 * - Internal system tasks: inserting into audit_logs, assistant_requests, reading app_config.
 * - Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row Level Security.
 * - NEVER use for normal user-facing CRUD without explicit manual authorization checks.
 * - NEVER send this client or its credentials to frontend/browser code.
 */
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

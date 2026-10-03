/**
 * Server-Side Authentication & Authorization — BIS Intelligent Assistant Backend
 * Follows Section 7, 8, 33, 34 of Master Implementation Prompt
 * NEVER trusts client-supplied user_id or role values.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from './errors.ts';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export async function getAuthenticatedUser(
  request: Request,
  supabaseClient: SupabaseClient
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return null;
  }

  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      throw AppError.authRequired('Invalid or expired authentication token.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.authRequired('Failed to authenticate token.');
  }
}

export async function requireAuthenticatedUser(
  request: Request,
  supabaseClient: SupabaseClient
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request, supabaseClient);
  if (!user) {
    throw AppError.authRequired('Authentication is required to access this endpoint.');
  }
  return user;
}

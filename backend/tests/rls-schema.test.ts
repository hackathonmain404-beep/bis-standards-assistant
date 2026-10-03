import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('RLS & Schema - Migration 1 (initial_schema.sql) structural verification', () => {
  const migrationPath = path.resolve('../supabase/migrations/20261003160000_initial_schema.sql');
  assert.equal(fs.existsSync(migrationPath), true, 'Initial schema migration must exist');

  const content = fs.readFileSync(migrationPath, 'utf8');

  // Verify all 5 core tables exist
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.users'), 'users table must exist');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.sessions'), 'sessions table must exist');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.messages'), 'messages table must exist');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.citations'), 'citations table must exist');
  assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.app_config'), 'app_config table must exist');

  // Verify foreign keys & cascade rules
  assert.ok(content.includes('REFERENCES auth.users(id) ON DELETE CASCADE'), 'users table links to auth.users with cascade');
  assert.ok(content.includes('REFERENCES public.users(id) ON DELETE CASCADE'), 'sessions links to users with cascade');
  assert.ok(content.includes('REFERENCES public.sessions(id) ON DELETE CASCADE'), 'messages links to sessions with cascade');
  assert.ok(content.includes('REFERENCES public.messages(id) ON DELETE CASCADE'), 'citations links to messages with cascade');

  // Verify indexes
  assert.ok(content.includes('idx_sessions_user_id'), 'idx_sessions_user_id must exist');
  assert.ok(content.includes('idx_sessions_updated_at'), 'idx_sessions_updated_at must exist');
  assert.ok(content.includes('idx_messages_session_id'), 'idx_messages_session_id must exist');
  assert.ok(content.includes('idx_messages_created_at'), 'idx_messages_created_at must exist');
  assert.ok(content.includes('idx_messages_client_request_id'), 'idx_messages_client_request_id must exist');
  assert.ok(content.includes('idx_citations_message_id'), 'idx_citations_message_id must exist');
});

test('RLS & Schema - Migration 2 (rls_policies.sql) security verification', () => {
  const rlsPath = path.resolve('../supabase/migrations/20261003160500_rls_policies.sql');
  assert.equal(fs.existsSync(rlsPath), true, 'RLS migration must exist');

  const content = fs.readFileSync(rlsPath, 'utf8');

  // Verify RLS enabled on all tables
  assert.ok(content.includes('ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on users');
  assert.ok(content.includes('ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on sessions');
  assert.ok(content.includes('ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on messages');
  assert.ok(content.includes('ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on citations');
  assert.ok(content.includes('ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;'), 'RLS enabled on app_config');

  // Verify ownership policies exist
  assert.ok(content.includes('auth.uid() = id'), 'Users ownership policy checks auth.uid()');
  assert.ok(content.includes('auth.uid() = user_id'), 'Sessions ownership policy checks auth.uid()');
  assert.ok(content.includes('s.user_id = auth.uid()'), 'Messages and Citations ownership policies verify parent session');

  // Verify app_config read-only policy for anon/authenticated
  assert.ok(content.includes('CREATE POLICY "app_config_read_public"'), 'app_config has public read policy');
});

test('RLS & Schema - Seed script (seed.sql) verification', () => {
  const seedPath = path.resolve('../supabase/seed.sql');
  assert.equal(fs.existsSync(seedPath), true, 'seed.sql must exist');

  const content = fs.readFileSync(seedPath, 'utf8');

  // Verify demo labels prevent confusion with authoritative BIS records
  assert.ok(content.includes('[DEMO]'), 'Demo sessions are clearly labeled');
  assert.ok(content.includes('[DEMO TEST RESPONSE]'), 'Demo messages are clearly labeled');
  assert.ok(content.includes('[DEMO SNIPPET]'), 'Demo citations are clearly labeled');
});

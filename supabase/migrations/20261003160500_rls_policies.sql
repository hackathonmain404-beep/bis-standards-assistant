-- Migration: 20261003160500_rls_policies.sql
-- Description: Strict Row Level Security (RLS) policies for user data protection
-- Principle: DENY BY DEFAULT. Users can access only their own data.
-- References: docs/api/SECURITY.md, docs/architecture/DATABASE_SCHEMA.md

-- 1. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- 2. Users table policies
-- Users can only view their own profile
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can only insert their own profile
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
CREATE POLICY "users_insert_own"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Sessions table policies
-- Authenticated users can only read their own sessions
DROP POLICY IF EXISTS "sessions_select_own" ON public.sessions;
CREATE POLICY "sessions_select_own"
ON public.sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Authenticated users can create sessions with their own user_id
DROP POLICY IF EXISTS "sessions_insert_own" ON public.sessions;
CREATE POLICY "sessions_insert_own"
ON public.sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own sessions
DROP POLICY IF EXISTS "sessions_update_own" ON public.sessions;
CREATE POLICY "sessions_update_own"
ON public.sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete their own sessions
DROP POLICY IF EXISTS "sessions_delete_own" ON public.sessions;
CREATE POLICY "sessions_delete_own"
ON public.sessions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Messages table policies
-- Messages can only be read if the parent session belongs to the user
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
CREATE POLICY "messages_select_own"
ON public.messages
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id
          AND s.user_id = auth.uid()
    )
);

-- Messages can only be inserted into a session owned by the user
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;
CREATE POLICY "messages_insert_own"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id
          AND s.user_id = auth.uid()
    )
);

-- Messages can only be updated if owned by the user
DROP POLICY IF EXISTS "messages_update_own" ON public.messages;
CREATE POLICY "messages_update_own"
ON public.messages
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id
          AND s.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id
          AND s.user_id = auth.uid()
    )
);

-- Messages can only be deleted if owned by the user
DROP POLICY IF EXISTS "messages_delete_own" ON public.messages;
CREATE POLICY "messages_delete_own"
ON public.messages
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.sessions s
        WHERE s.id = messages.session_id
          AND s.user_id = auth.uid()
    )
);

-- 5. Citations table policies
-- Citations can only be read if the linked message and session belong to the user
DROP POLICY IF EXISTS "citations_select_own" ON public.citations;
CREATE POLICY "citations_select_own"
ON public.citations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.sessions s ON s.id = m.session_id
        WHERE m.id = citations.message_id
          AND s.user_id = auth.uid()
    )
);

-- Citations can only be inserted if linked to the user's message
DROP POLICY IF EXISTS "citations_insert_own" ON public.citations;
CREATE POLICY "citations_insert_own"
ON public.citations
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.sessions s ON s.id = m.session_id
        WHERE m.id = citations.message_id
          AND s.user_id = auth.uid()
    )
);

-- Citations can only be deleted if linked to the user's message
DROP POLICY IF EXISTS "citations_delete_own" ON public.citations;
CREATE POLICY "citations_delete_own"
ON public.citations
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.messages m
        JOIN public.sessions s ON s.id = m.session_id
        WHERE m.id = citations.message_id
          AND s.user_id = auth.uid()
    )
);

-- 6. Application Configuration policies
-- Public / authenticated users can read configuration values
DROP POLICY IF EXISTS "app_config_read_public" ON public.app_config;
CREATE POLICY "app_config_read_public"
ON public.app_config
FOR SELECT
TO anon, authenticated
USING (true);

-- Modifications to app_config are restricted to service_role only (no public INSERT/UPDATE/DELETE)

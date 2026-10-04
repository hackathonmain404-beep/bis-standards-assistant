-- Migration: 20261004000000_audit_and_request_tracking.sql
-- Description: Audit logging and assistant request lifecycle tracking
-- Principle: Immutable audit trails; full request lifecycle tracking for idempotency & observability
-- References: Master Spec Section 26, 27, 36, 37

-- 1. Assistant Requests table (Application-level request tracking & state machine)
CREATE TABLE IF NOT EXISTS public.assistant_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_request_id TEXT,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (
        status IN (
            'RECEIVED',
            'VALIDATED',
            'AUTHORIZED',
            'CONTEXT_LOADED',
            'AI_PENDING',
            'AI_COMPLETED',
            'EVIDENCE_VALIDATED',
            'PERSISTED',
            'COMPLETED',
            'VALIDATION_FAILED',
            'UNAUTHORIZED',
            'AI_TIMEOUT',
            'AI_UNAVAILABLE',
            'AI_INVALID_RESPONSE',
            'PERSISTENCE_FAILED',
            'INTERNAL_ERROR'
        )
    ),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    latency_ms INTEGER,
    error_code TEXT,
    evidence_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_requests_client_id ON public.assistant_requests(client_request_id);
CREATE INDEX IF NOT EXISTS idx_assistant_requests_session_id ON public.assistant_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_assistant_requests_user_id ON public.assistant_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_assistant_requests_status ON public.assistant_requests(status);
CREATE INDEX IF NOT EXISTS idx_assistant_requests_created_at ON public.assistant_requests(created_at DESC);

-- Enable RLS on assistant_requests
ALTER TABLE public.assistant_requests ENABLE ROW LEVEL SECURITY;

-- Users can only view their own assistant requests
DROP POLICY IF EXISTS "assistant_requests_select_own" ON public.assistant_requests;
CREATE POLICY "assistant_requests_select_own"
ON public.assistant_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Modifications/inserts reserved for service_role (privileged server only)

-- 2. Audit Logs table (Immutable security & system events log)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'USER_CREATED',
            'AUTH_EVENT',
            'CONVERSATION_CREATED',
            'CONVERSATION_DELETED',
            'MESSAGE_CREATED',
            'ASSISTANT_REQUEST',
            'ASSISTANT_COMPLETED',
            'ASSISTANT_FAILED',
            'SAVED_ITEM_CREATED',
            'ADMIN_ACTION'
        )
    ),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    payload JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Immutability rule: NO public SELECT, UPDATE, or DELETE
-- Ordinary authenticated users cannot view audit logs
-- Service role only can write and query audit logs
DROP POLICY IF EXISTS "audit_logs_deny_public_select" ON public.audit_logs;
CREATE POLICY "audit_logs_deny_public_select"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (false);

DROP POLICY IF EXISTS "audit_logs_deny_public_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_deny_public_insert"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false);

DROP POLICY IF EXISTS "audit_logs_deny_public_update" ON public.audit_logs;
CREATE POLICY "audit_logs_deny_public_update"
ON public.audit_logs
FOR UPDATE
TO authenticated
USING (false);

DROP POLICY IF EXISTS "audit_logs_deny_public_delete" ON public.audit_logs;
CREATE POLICY "audit_logs_deny_public_delete"
ON public.audit_logs
FOR DELETE
TO authenticated
USING (false);

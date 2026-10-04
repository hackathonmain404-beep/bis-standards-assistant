-- Seed Data: supabase/seed.sql
-- Purpose: Deterministic development and local testing seed data.
-- NOTICE: Contains clearly marked mock and demo data for local verification only.
-- Real authoritative BIS standards are owned by the BIS Knowledge and AI/RAG layers.

-- 1. App Configuration Seed Data
INSERT INTO public.app_config (key, value, description)
VALUES
    ('app_name', 'BIS Intelligent Assistant', 'Application display name'),
    ('app_version', '0.1.0', 'Backend API version'),
    ('default_language', 'en', 'Default system language'),
    ('supported_languages', '["en", "hi"]', 'JSON array of supported ISO language codes'),
    ('max_message_chars', '5000', 'Maximum characters permitted in a user message'),
    ('chat_rate_limit_per_minute', '20', 'Default chat endpoint rate limit')
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = now();

-- 2. Mock Test Sessions (for development/testing verification only)
-- Fixed test UUIDs for deterministic testing
INSERT INTO public.sessions (id, title, language, created_at, updated_at, is_active)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        '[DEMO] Electric steam iron compliance',
        'en',
        '2026-10-03 14:00:00+00',
        '2026-10-03 14:05:00+00',
        true
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Mock Test Messages
INSERT INTO public.messages (id, session_id, role, content, intent, language, created_at)
VALUES
    (
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0000-000000000001',
        'user',
        'I manufacture a domestic electric steam iron. Which BIS standards apply?',
        NULL,
        'en',
        '2026-10-03 14:00:00+00'
    ),
    (
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0000-000000000001',
        'assistant',
        '[DEMO TEST RESPONSE] For domestic electric steam irons, the primary Indian Standard is IS 302 (Part 2/Sec 3):2007 covering particular requirements for electric irons [1].',
        'PRODUCT_DISCOVERY',
        'en',
        '2026-10-03 14:00:05+00'
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Mock Test Citations
INSERT INTO public.citations (id, message_id, citation_index, standard_id, document_title, section, clause, snippet)
VALUES
    (
        '00000000-0000-0000-0000-000000000021',
        '00000000-0000-0000-0000-000000000012',
        1,
        'IS 302 (Part 2/Sec 3):2007',
        'Safety of Household and Similar Electrical Appliances — Particular Requirements for Electric Irons',
        'Section 1 Scope',
        'Clause 1.1',
        '[DEMO SNIPPET] This standard applies to electric dry irons and steam irons for household and similar use.'
    )
ON CONFLICT (id) DO NOTHING;

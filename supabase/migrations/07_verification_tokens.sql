-- Migration: 07_verification_tokens.sql
-- Purpose:   Add verification token storage for email verification and password reset.

CREATE TABLE IF NOT EXISTS public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token CHAR(6) NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS verification_tokens_user_purpose_expires_idx
  ON public.verification_tokens (user_id, purpose, expires_at);

ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY deny_all ON public.verification_tokens
  FOR ALL
  USING (false)
  WITH CHECK (false);

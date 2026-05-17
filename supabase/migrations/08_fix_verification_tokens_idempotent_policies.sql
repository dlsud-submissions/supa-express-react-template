-- =============================================================================
-- File:    supabase/migrations/08_fix_verification_tokens_idempotent_policies.sql
-- Purpose: Make verification_tokens RLS policies idempotent.
--          Previously CREATE POLICY had no DROP IF EXISTS guard, causing a
--          42710 error ("policy already exists") on any re-run of the SQL.
-- =============================================================================

DROP POLICY IF EXISTS "deny_all" ON public.verification_tokens;
DROP POLICY IF EXISTS "service_role_manage_tokens" ON public.verification_tokens;
DROP POLICY IF EXISTS "users_read_own_tokens" ON public.verification_tokens;

-- Block all direct access — tokens are only manipulated via SECURITY DEFINER functions.
CREATE POLICY "deny_all"
  ON public.verification_tokens
  FOR ALL
  USING (false);

-- =============================================================================
-- Module: grants.sql
-- Purpose: Grant schema and table privileges to Supabase roles.
-- Run via: Supabase Dashboard → SQL Editor
-- Order:   4 — run after tables.sql, before rls.sql
--
-- Notes:
--   - 'authenticated' is the Supabase role assumed by logged-in users.
--   - 'anon' is the Supabase role assumed by unauthenticated requests.
--   - Never grant INSERT/DELETE on public.users to authenticated — rows are
--     managed exclusively by DB triggers on auth.users.
-- =============================================================================

-- Schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- public.users — authenticated users can read and update (own row or via RLS)
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;

-- RLS helper function — must be executable by authenticated users
-- (the function itself is created in rls.sql; the grant is here for clarity)
-- GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
-- ^ Uncomment if Supabase does not grant this automatically after rls.sql runs.
--   In practice Supabase grants EXECUTE to authenticated for SECURITY DEFINER
--   functions by default, so this is usually not needed.

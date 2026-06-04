-- =============================================================================
-- Module: rls.sql
-- Purpose: Enable RLS and define access policies for public.users.
-- Run via: Supabase Dashboard → SQL Editor
-- Order:   5 — run after grants.sql
--
-- Policy summary:
--   SELECT  USER        → own row only
--   SELECT  ADMIN       → all rows
--   SELECT  SUPER_ADMIN → all rows
--   UPDATE  SUPER_ADMIN → any row (role field included)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: get_current_user_role()
-- Returns the app_role of the currently authenticated user.
-- SECURITY DEFINER so it can read public.users without triggering RLS itself
-- (avoids infinite recursion on the SELECT policy).
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM   public.users
  WHERE  id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS on public.users
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- SELECT policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile"   ON public.users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (public.get_current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

-- -----------------------------------------------------------------------------
-- UPDATE policy
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Super admins can update roles" ON public.users;

CREATE POLICY "Super admins can update roles"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING     (public.get_current_user_role() = 'SUPER_ADMIN')
  WITH CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));

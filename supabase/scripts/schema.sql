-- =============================================================================
-- schema.sql
-- Purpose:  Full database schema for a fresh Supabase project.
--           This file runs all modules in the correct dependency order.
--
-- Usage (two options):
--
--   Option A — Run this file directly in the SQL Editor.
--              It contains all module SQL inline, in order.
--              This is the recommended approach for most collaborators.
--
--   Option B — Run each module file individually in the SQL Editor,
--              in the order listed below. Use this when you only need
--              to re-apply a specific layer (e.g. re-run rls.sql after
--              tweaking a policy).
--
-- Module execution order:
--   1. modules/extensions.sql
--   2. modules/enums.sql
--   3. modules/tables.sql
--   4. modules/grants.sql
--   5. modules/rls.sql
--   6. modules/triggers.sql
--
-- After running this file, optionally run scripts/seed.sql to populate
-- test accounts.
-- =============================================================================


-- =============================================================================
-- [1] extensions.sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- [2] enums.sql
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END
$$;


-- =============================================================================
-- [3] tables.sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID            PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    VARCHAR(20)     UNIQUE NOT NULL,
  role        public.app_role NOT NULL DEFAULT 'USER',
  avatar_url  TEXT            DEFAULT NULL,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  last_login  TIMESTAMPTZ     DEFAULT NULL
);

COMMENT ON TABLE  public.users              IS 'Application profile rows mirrored from auth.users via DB triggers.';
COMMENT ON COLUMN public.users.username     IS 'App-facing display name. For email/password users this is set at signup. For OAuth users it is derived from provider metadata.';
COMMENT ON COLUMN public.users.avatar_url   IS 'Profile photo URL. Populated for OAuth users from raw_user_meta_data.';
COMMENT ON COLUMN public.users.last_login   IS 'Timestamp of most recent sign-in. Updated by the on_auth_user_login trigger.';


-- =============================================================================
-- [4] grants.sql
-- =============================================================================

GRANT USAGE  ON SCHEMA public        TO authenticated;
GRANT USAGE  ON SCHEMA public        TO anon;
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;


-- =============================================================================
-- [5] rls.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile"   ON public.users;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Super admins can update roles" ON public.users;

CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON public.users FOR SELECT TO authenticated
  USING (public.get_current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY "Super admins can update roles"
  ON public.users FOR UPDATE TO authenticated
  USING     (public.get_current_user_role() = 'SUPER_ADMIN')
  WITH CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));


-- =============================================================================
-- [6] triggers.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.derive_base_username(
  p_meta  JSONB,
  p_email TEXT,
  p_id    UUID
)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_candidate TEXT;
BEGIN
  v_candidate := p_meta->>'username';
  IF v_candidate IS NOT NULL AND length(trim(v_candidate)) > 0 THEN
    RETURN lower(trim(v_candidate));
  END IF;

  v_candidate := COALESCE(p_meta->>'name', p_meta->>'full_name');
  IF v_candidate IS NOT NULL AND length(trim(v_candidate)) > 0 THEN
    v_candidate := lower(trim(v_candidate));
    v_candidate := regexp_replace(v_candidate, '[\s\-]+',    '_', 'g');
    v_candidate := regexp_replace(v_candidate, '[^a-z0-9_]', '',  'g');
    v_candidate := regexp_replace(v_candidate, '_+',         '_', 'g');
    v_candidate := trim(v_candidate, '_');
    IF length(v_candidate) >= 3 THEN
      RETURN v_candidate;
    END IF;
  END IF;

  IF p_email IS NOT NULL THEN
    v_candidate := split_part(p_email, '@', 1);
    IF length(v_candidate) >= 3 THEN
      RETURN lower(v_candidate);
    END IF;
  END IF;

  RETURN 'user_' || substr(p_id::text, 1, 8);
END;
$$;

CREATE OR REPLACE FUNCTION public.resolve_username_collision(p_base TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_candidate TEXT    := p_base;
  v_exists    BOOLEAN;
  v_attempts  INT     := 0;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE username = v_candidate
  ) INTO v_exists;

  WHILE v_exists AND v_attempts < 10 LOOP
    v_candidate := p_base || '_' || substr(md5(random()::text), 1, 4);
    SELECT EXISTS (
      SELECT 1 FROM public.users WHERE username = v_candidate
    ) INTO v_exists;
    v_attempts := v_attempts + 1;
  END LOOP;

  RETURN v_candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_username TEXT;
  v_username      TEXT;
  v_avatar_url    TEXT;
BEGIN
  v_base_username := public.derive_base_username(
    NEW.raw_user_meta_data, NEW.email, NEW.id
  );
  v_username   := public.resolve_username_collision(v_base_username);
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  INSERT INTO public.users (id, username, avatar_url, created_at)
  VALUES (NEW.id, v_username, v_avatar_url, NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users SET last_login = NOW() WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login   ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_login();

INSERT INTO public.users (id, username, avatar_url, created_at)
SELECT
  au.id,
  public.resolve_username_collision(
    public.derive_base_username(au.raw_user_meta_data, au.email, au.id)
  ),
  au.raw_user_meta_data->>'avatar_url',
  COALESCE(au.created_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id);

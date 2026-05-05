-- =============================================================================
-- File:      supabase/schema.sql
-- Purpose:   Baseline Supabase schema for a fresh project.
--
-- Includes:
--   - app_role enum
--   - public.users table
--   - RLS helper + policies
--   - auth trigger functions for signup and login sync
--
-- Apply this first on a brand-new Supabase project, then apply any versioned
-- files in supabase/migrations/ that build on this baseline.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Role enum
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END
$$;

-- -----------------------------------------------------------------------------
-- 2. Profile table mirrored from auth.users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(20) UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  username_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  role public.app_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NULL
);

COMMENT ON TABLE public.users IS
  'Application profile rows mirrored from auth.users via DB triggers.';

COMMENT ON COLUMN public.users.username IS
  'App-facing username shown in the UI and used for app.local auth emails.';

COMMENT ON COLUMN public.users.email IS
  'The OAuth email address provided by the identity provider when available.';

COMMENT ON COLUMN public.users.avatar_url IS
  'The avatar URL provided by the OAuth provider when available.';

COMMENT ON COLUMN public.users.provider IS
  'The auth provider that created this profile row, such as email or google.';

COMMENT ON COLUMN public.users.username_confirmed IS
  'Whether the user explicitly confirmed the username shown in the app.';

-- -----------------------------------------------------------------------------
-- 3. Grants required for the client-side Supabase SDK
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.users TO authenticated;

-- -----------------------------------------------------------------------------
-- 4. RLS helper + policies
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.users
  WHERE id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.users;
CREATE POLICY "Admins can read all profiles"
ON public.users
FOR SELECT
TO authenticated
USING (public.get_current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Super admins can update roles" ON public.users;
CREATE POLICY "Super admins can update roles"
ON public.users
FOR UPDATE
TO authenticated
USING (public.get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));

-- -----------------------------------------------------------------------------
-- 5. Trigger functions that sync auth.users into public.users
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived_username TEXT;
  provider_value TEXT;
  confirmed BOOLEAN;
BEGIN
  derived_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  provider_value := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );

  confirmed := provider_value <> 'google';

  INSERT INTO public.users (
    id,
    username,
    role,
    created_at,
    email,
    avatar_url,
    provider,
    username_confirmed
  )
  VALUES (
    NEW.id,
    derived_username,
    'USER',
    COALESCE(NEW.created_at, NOW()),
    NULLIF(NEW.raw_user_meta_data->>'email', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    provider_value,
    confirmed
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET last_login = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. Auth triggers
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();

-- -----------------------------------------------------------------------------
-- 7. Backfill any auth users created before the triggers existed
-- -----------------------------------------------------------------------------
INSERT INTO public.users (id, username, role, created_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  'USER',
  COALESCE(au.created_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1
  FROM public.users pu
  WHERE pu.id = au.id
);

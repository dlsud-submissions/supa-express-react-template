-- Migration: 03_handle_new_user_oauth.sql
-- Purpose:   Update the auth user trigger to support Google OAuth user
--            creation with slugified usernames, email/avatar population,
--            and provider tracking.

-- Ensure required profile columns exist before the trigger runs.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS username_confirmed BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.users.email IS
  'The OAuth email address provided by the identity provider when available.';

COMMENT ON COLUMN public.users.provider IS
  'The auth provider that created this profile row, such as email or google.';

COMMENT ON COLUMN public.users.username_confirmed IS
  'Whether the user explicitly confirmed the username shown in the app.';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_username TEXT;
  v_username TEXT;
  v_avatar_url TEXT;
  v_email TEXT;
  v_provider TEXT;
  v_username_confirmed BOOLEAN;
  v_suffix INT := 0;
  v_candidate TEXT;
BEGIN
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  v_email := NULLIF(NEW.raw_user_meta_data->>'email', '');

  IF v_provider = 'google' THEN
    v_base_username := regexp_replace(
      lower(coalesce(NEW.raw_user_meta_data->>'full_name', '')),
      '[^a-z0-9]+',
      '_',
      'g'
    );
    v_base_username := regexp_replace(v_base_username, '^_+|_+$', '', 'g');
  ELSE
    v_base_username := COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    );
    v_base_username := regexp_replace(lower(coalesce(v_base_username, '')), '[^a-z0-9_]', '', 'g');
  END IF;

  IF v_base_username IS NULL OR v_base_username = '' THEN
    v_base_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  v_candidate := v_base_username;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.users WHERE username = v_candidate
    );
    v_suffix := v_suffix + 1;
    v_candidate := v_base_username || '_' || v_suffix;
  END LOOP;

  v_username := v_candidate;
  v_username_confirmed := v_provider <> 'google';

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
    v_username,
    'USER',
    COALESCE(NEW.created_at, NOW()),
    v_email,
    v_avatar_url,
    v_provider,
    v_username_confirmed
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

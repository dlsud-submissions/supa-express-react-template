-- Migration: 04_users_add_oauth_fields.sql
-- Purpose:   Extend public.users to retain OAuth profile fields.

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

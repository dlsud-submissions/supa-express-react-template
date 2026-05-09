-- Migration: 04_email_first_auth.sql
-- Purpose:   Migrate public.users to real email auth and make username nullable.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.users
  ALTER COLUMN username DROP NOT NULL;

UPDATE public.users u
SET email = au.email
FROM auth.users au
WHERE u.id = au.id
  AND (u.email IS NULL OR u.email = '');

ALTER TABLE public.users
  ALTER COLUMN email SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON public.users (email);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_username TEXT;
  v_provider TEXT;
  v_username_confirmed BOOLEAN;
BEGIN
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  v_email := COALESCE(NULLIF(NEW.raw_user_meta_data->>'email', ''), NEW.email);
  v_username := NULLIF(NEW.raw_user_meta_data->>'username', '');
  v_username_confirmed := v_provider <> 'google';

  INSERT INTO public.users (
    id,
    username,
    role,
    created_at,
    email,
    avatar_url,
    provider,
    username_confirmed,
    is_verified
  )
  VALUES (
    NEW.id,
    v_username,
    'USER',
    COALESCE(NEW.created_at, NOW()),
    v_email,
    NEW.raw_user_meta_data->>'avatar_url',
    v_provider,
    v_username_confirmed,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

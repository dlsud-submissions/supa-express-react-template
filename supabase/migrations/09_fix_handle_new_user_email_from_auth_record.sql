-- =============================================================================
-- File:    supabase/migrations/09_fix_handle_new_user_email_from_auth_record.sql
-- Purpose: Fix handle_new_user() trigger so email is read from NEW.email
--          (the auth.users record) instead of raw_user_meta_data->>'email',
--          which the Supabase SDK never populates for email/password signups.
--          Also changes ON CONFLICT DO NOTHING → DO UPDATE so the trigger
--          stays in sync if it fires again for an existing user.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived_username TEXT;
  provider_value   TEXT;
  confirmed        BOOLEAN;
BEGIN
  derived_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  provider_value := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );

  -- Google users come pre-verified; email/password users need OTP verification.
  confirmed := provider_value = 'google';

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
    derived_username,
    'USER',
    COALESCE(NEW.created_at, NOW()),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    provider_value,
    confirmed,
    confirmed
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = EXCLUDED.email,
    provider   = EXCLUDED.provider,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url);

  RETURN NEW;
END;
$$;

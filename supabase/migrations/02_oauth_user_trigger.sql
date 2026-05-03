-- Migration: 02_oauth_user_trigger.sql
-- Extends public.users to support Google OAuth users.
-- Adds avatar_url column and updates handle_new_user to derive
-- a safe username when one is not explicitly provided.

-- 1. Add avatar_url column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Drop and recreate the handle_new_user trigger function
--    to support both email/password and OAuth signups.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  derived_username TEXT;
  base_username    TEXT;
  suffix           INT := 0;
  candidate        TEXT;
BEGIN
  -- Priority 1: explicit username from email/password signup metadata
  derived_username := new.raw_user_meta_data->>'username';

  -- Priority 2: sanitize the full_name provided by Google OAuth
  IF derived_username IS NULL OR derived_username = '' THEN
    base_username := regexp_replace(
      lower(coalesce(new.raw_user_meta_data->>'name', '')),
      '[^a-z0-9_]', '', 'g'
    );
    derived_username := base_username;
  END IF;

  -- Priority 3: extract local part of email (strips @app.local for pw users)
  IF derived_username IS NULL OR derived_username = '' THEN
    derived_username := split_part(new.email, '@', 1);
    derived_username := regexp_replace(lower(derived_username), '[^a-z0-9_]', '', 'g');
  END IF;

  -- Priority 4: guaranteed fallback
  IF derived_username IS NULL OR derived_username = '' THEN
    derived_username := 'user_' || substr(new.id::text, 1, 8);
  END IF;

  -- Resolve username collisions by appending an incrementing suffix
  candidate := derived_username;
  LOOP
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.users WHERE username = candidate
    );
    suffix := suffix + 1;
    candidate := derived_username || '_' || suffix;
  END LOOP;

  INSERT INTO public.users (id, username, role, avatar_url)
  VALUES (
    new.id,
    candidate,
    'USER',
    new.raw_user_meta_data->>'avatar_url'
  );

  RETURN new;
END;
$$;

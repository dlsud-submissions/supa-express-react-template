-- =============================================================================
-- Migration: 02_oauth_user_trigger.sql
-- Purpose:   Update handle_new_user trigger to support Google OAuth users.
--
-- Changes:
--   1. Add avatar_url column to public.users
--   2. Replace handle_new_user() with an OAuth-aware version that derives
--      a safe, unique username for Google users while preserving existing
--      email/password signup behavior.
--
-- Username derivation priority:
--   1. raw_user_meta_data->>'username'         (email/password signups)
--   2. Sanitized raw_user_meta_data->>'name'   (Google full_name, lowercase, alphanum+_ only)
--   3. Local part of email before @app.local   (email/password fallback)
--   4. 'user_' || first 8 chars of UUID        (final fallback)
--
-- Collision resolution: append '_' || random 4-char hex suffix and retry.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Step 1: Add avatar_url column to public.users
-- -----------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.users.avatar_url IS
  'Profile photo URL — populated for Google OAuth users from raw_user_meta_data.';

-- -----------------------------------------------------------------------------
-- Step 2: Helper function — derive a base username candidate from auth metadata
-- -----------------------------------------------------------------------------
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
  -- Priority 1: explicit username (email/password signups)
  v_candidate := p_meta->>'username';
  IF v_candidate IS NOT NULL AND length(trim(v_candidate)) > 0 THEN
    RETURN lower(trim(v_candidate));
  END IF;

  -- Priority 2: sanitize Google full_name / name field
  v_candidate := coalesce(p_meta->>'name', p_meta->>'full_name');
  IF v_candidate IS NOT NULL AND length(trim(v_candidate)) > 0 THEN
    -- lowercase, replace spaces and hyphens with underscore,
    -- strip all non-alphanumeric/underscore characters, collapse underscores
    v_candidate := lower(trim(v_candidate));
    v_candidate := regexp_replace(v_candidate, '[\s\-]+',  '_', 'g');
    v_candidate := regexp_replace(v_candidate, '[^a-z0-9_]', '',  'g');
    v_candidate := regexp_replace(v_candidate, '_+',         '_', 'g');
    v_candidate := trim(v_candidate, '_');
    IF length(v_candidate) >= 3 THEN
      RETURN v_candidate;
    END IF;
  END IF;

  -- Priority 3: local part of email before @app.local (email/password fallback)
  IF p_email IS NOT NULL AND p_email LIKE '%@app.local' THEN
    v_candidate := split_part(p_email, '@', 1);
    IF length(v_candidate) >= 3 THEN
      RETURN lower(v_candidate);
    END IF;
  END IF;

  -- Priority 4: uuid-based fallback
  RETURN 'user_' || substr(p_id::text, 1, 8);
END;
$$;

-- -----------------------------------------------------------------------------
-- Step 3: Helper function — resolve collisions by appending a random hex suffix
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_username_collision(p_base TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_candidate TEXT := p_base;
  v_exists    BOOLEAN;
  v_attempts  INT := 0;
BEGIN
  -- Check if the base is already taken
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE username = v_candidate
  ) INTO v_exists;

  WHILE v_exists AND v_attempts < 10 LOOP
    -- Append a 4-character random hex suffix
    v_candidate := p_base || '_' || substr(md5(random()::text), 1, 4);
    SELECT EXISTS (
      SELECT 1 FROM public.users WHERE username = v_candidate
    ) INTO v_exists;
    v_attempts := v_attempts + 1;
  END LOOP;

  RETURN v_candidate;
END;
$$;

-- -----------------------------------------------------------------------------
-- Step 4: Replace the trigger function with the OAuth-aware version
-- -----------------------------------------------------------------------------
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
  -- Derive the base username candidate
  v_base_username := public.derive_base_username(
    NEW.raw_user_meta_data,
    NEW.email,
    NEW.id
  );

  -- Resolve any collision against existing rows
  v_username := public.resolve_username_collision(v_base_username);

  -- Extract avatar URL (present for Google OAuth users)
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  INSERT INTO public.users (id, username, avatar_url)
  VALUES (NEW.id, v_username, v_avatar_url);

  RETURN NEW;
END;
$$;

-- Re-attach the trigger (CREATE OR REPLACE does not re-register it)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Step 5: Back-fill avatar_url for any existing Google OAuth users
--         (safe no-op for email/password users who have no avatar_url in meta)
-- -----------------------------------------------------------------------------
UPDATE public.users u
SET    avatar_url = (
         SELECT raw_user_meta_data->>'avatar_url'
         FROM   auth.users a
         WHERE  a.id = u.id
         AND    raw_user_meta_data->>'avatar_url' IS NOT NULL
       )
WHERE  avatar_url IS NULL;

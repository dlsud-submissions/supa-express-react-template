-- =============================================================================
-- Module: triggers.sql
-- Purpose: Define functions and triggers that keep public.users in sync
--          with auth.users.
-- Run via: Supabase Dashboard → SQL Editor
-- Order:   6 — run after rls.sql (last module)
--
-- Triggers:
--   on_auth_user_created  → fires AFTER INSERT on auth.users
--                           creates the public.users profile row
--   on_auth_user_login    → fires AFTER UPDATE OF last_sign_in_at on auth.users
--                           updates last_login on the profile row
--
-- Username derivation priority (for on_auth_user_created):
--   1. raw_user_meta_data->>'username'       (email/password signups)
--   2. Sanitized raw_user_meta_data->>'name' (OAuth full_name, e.g. Google)
--   3. Local part of email before @          (email/password fallback)
--   4. 'user_' || first 8 chars of UUID      (final fallback)
--
-- Collision resolution: appends '_' || random 4-char hex suffix (up to 10 tries).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: derive_base_username()
-- Derives a clean username candidate from Supabase auth metadata.
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
  -- Priority 1: explicit username set at signup (email/password flow)
  v_candidate := p_meta->>'username';
  IF v_candidate IS NOT NULL AND length(trim(v_candidate)) > 0 THEN
    RETURN lower(trim(v_candidate));
  END IF;

  -- Priority 2: sanitize OAuth display name (Google 'name' / 'full_name')
  v_candidate := COALESCE(p_meta->>'name', p_meta->>'full_name');
  IF v_candidate IS NOT NULL AND length(trim(v_candidate)) > 0 THEN
    v_candidate := lower(trim(v_candidate));
    v_candidate := regexp_replace(v_candidate, '[\s\-]+',   '_', 'g');
    v_candidate := regexp_replace(v_candidate, '[^a-z0-9_]', '',  'g');
    v_candidate := regexp_replace(v_candidate, '_+',         '_', 'g');
    v_candidate := trim(v_candidate, '_');
    IF length(v_candidate) >= 3 THEN
      RETURN v_candidate;
    END IF;
  END IF;

  -- Priority 3: local part of email (before @)
  IF p_email IS NOT NULL THEN
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
-- Helper: resolve_username_collision()
-- Appends a random hex suffix until the username is unique.
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Trigger function: handle_new_user()
-- Fires AFTER INSERT on auth.users → inserts a public.users profile row.
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
  v_base_username := public.derive_base_username(
    NEW.raw_user_meta_data,
    NEW.email,
    NEW.id
  );
  v_username   := public.resolve_username_collision(v_base_username);
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  INSERT INTO public.users (id, username, avatar_url, created_at)
  VALUES (NEW.id, v_username, v_avatar_url, NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Trigger function: handle_user_login()
-- Fires AFTER UPDATE OF last_sign_in_at on auth.users → updates last_login.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET    last_login = NOW()
  WHERE  id = NEW.id;

  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- Triggers
-- Drop first so this script is safe to re-run.
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login   ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();

-- -----------------------------------------------------------------------------
-- Backfill: sync any auth.users rows that existed before triggers were created.
-- Safe to run multiple times — ON CONFLICT DO NOTHING prevents duplicates.
-- -----------------------------------------------------------------------------
INSERT INTO public.users (id, username, avatar_url, created_at)
SELECT
  au.id,
  public.resolve_username_collision(
    public.derive_base_username(au.raw_user_meta_data, au.email, au.id)
  ),
  au.raw_user_meta_data->>'avatar_url',
  COALESCE(au.created_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

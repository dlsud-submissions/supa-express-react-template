-- ============================================================================
-- File:     supabase/seed.sql
-- Purpose:  Seed four development accounts for local testing.
--
-- Accounts created:
--   - Bryan / testpass123 / USER
--   - Odin  / testpass123 / ADMIN
--   - Damon / testpass123 / USER
--   - Boss  / testpass123 / SUPER_ADMIN
--
-- Notes:
--   - Run supabase/schema.sql first so the public.users trigger exists.
--   - This file inserts auth.users rows and then aligns public.users roles.
--   - Safe to re-run: existing users are updated instead of duplicated.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  bryan_id  UUID := 'f2c89108-69a7-4556-ae28-0189b1f5221c';
  odin_id   UUID := gen_random_uuid();
  damon_id  UUID := gen_random_uuid();
  boss_id   UUID := gen_random_uuid();
BEGIN

  -- ── Bryan (USER) ──────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    role, aud, instance_id, confirmation_token, recovery_token,
    email_change_token_new, email_change
  )
  VALUES (
    bryan_id,
    'bryan@app.local',
    crypt('testpass123', gen_salt('bf')),
    NOW(),
    jsonb_build_object('username', 'Bryan'),
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000',
    '', '', '', ''
  )
  ON CONFLICT (id) DO UPDATE
    SET encrypted_password  = EXCLUDED.encrypted_password,
        email               = EXCLUDED.email,
        email_confirmed_at  = COALESCE(auth.users.email_confirmed_at, NOW()),
        raw_user_meta_data  = EXCLUDED.raw_user_meta_data,
        updated_at          = NOW();

  -- Upsert public.users — includes email to satisfy NOT NULL constraint
  INSERT INTO public.users (id, username, role, email, is_email_verified)
  VALUES (bryan_id, 'Bryan', 'USER', 'bryan@app.local', true)
  ON CONFLICT (id) DO UPDATE
    SET role              = 'USER',
        email             = 'bryan@app.local',
        is_email_verified = true;

  -- ── Odin (ADMIN) ──────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    role, aud, instance_id, confirmation_token, recovery_token,
    email_change_token_new, email_change
  )
  VALUES (
    odin_id,
    'odin@app.local',
    crypt('testpass123', gen_salt('bf')),
    NOW(),
    jsonb_build_object('username', 'Odin'),
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000',
    '', '', '', ''
  )
  ON CONFLICT (id) DO UPDATE
    SET encrypted_password  = EXCLUDED.encrypted_password,
        email               = EXCLUDED.email,
        email_confirmed_at  = COALESCE(auth.users.email_confirmed_at, NOW()),
        raw_user_meta_data  = EXCLUDED.raw_user_meta_data,
        updated_at          = NOW();

  INSERT INTO public.users (id, username, role, email, is_email_verified)
  VALUES (odin_id, 'Odin', 'ADMIN', 'odin@app.local', true)
  ON CONFLICT (id) DO UPDATE
    SET role              = 'ADMIN',
        email             = 'odin@app.local',
        is_email_verified = true;

  -- ── Damon (USER) ──────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    role, aud, instance_id, confirmation_token, recovery_token,
    email_change_token_new, email_change
  )
  VALUES (
    damon_id,
    'damon@app.local',
    crypt('testpass123', gen_salt('bf')),
    NOW(),
    jsonb_build_object('username', 'Damon'),
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000',
    '', '', '', ''
  )
  ON CONFLICT (id) DO UPDATE
    SET encrypted_password  = EXCLUDED.encrypted_password,
        email               = EXCLUDED.email,
        email_confirmed_at  = COALESCE(auth.users.email_confirmed_at, NOW()),
        raw_user_meta_data  = EXCLUDED.raw_user_meta_data,
        updated_at          = NOW();

  INSERT INTO public.users (id, username, role, email, is_email_verified)
  VALUES (damon_id, 'Damon', 'USER', 'damon@app.local', true)
  ON CONFLICT (id) DO UPDATE
    SET role              = 'USER',
        email             = 'damon@app.local',
        is_email_verified = true;

  -- ── Boss (SUPER_ADMIN) ────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_user_meta_data, created_at, updated_at,
    role, aud, instance_id, confirmation_token, recovery_token,
    email_change_token_new, email_change
  )
  VALUES (
    boss_id,
    'boss@app.local',
    crypt('testpass123', gen_salt('bf')),
    NOW(),
    jsonb_build_object('username', 'Boss'),
    NOW(), NOW(),
    'authenticated', 'authenticated',
    '00000000-0000-0000-0000-000000000000',
    '', '', '', ''
  )
  ON CONFLICT (id) DO UPDATE
    SET encrypted_password  = EXCLUDED.encrypted_password,
        email               = EXCLUDED.email,
        email_confirmed_at  = COALESCE(auth.users.email_confirmed_at, NOW()),
        raw_user_meta_data  = EXCLUDED.raw_user_meta_data,
        updated_at          = NOW();

  INSERT INTO public.users (id, username, role, email, is_email_verified)
  VALUES (boss_id, 'Boss', 'SUPER_ADMIN', 'boss@app.local', true)
  ON CONFLICT (id) DO UPDATE
    SET role              = 'SUPER_ADMIN',
        email             = 'boss@app.local',
        is_email_verified = true;

END $$;

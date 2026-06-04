-- =============================================================================
-- seed.sql
-- Purpose:  Populate development test accounts.
--           Run AFTER schema.sql on a fresh project.
-- Run via:  Supabase Dashboard → SQL Editor
--
-- Accounts created:
--   username  password       role
--   --------  -----------    -----------
--   Bryan     testpass123    USER
--   Admin     testpass123    ADMIN
--   Damon     testpass123    USER
--   Boss      testpass123    SUPER_ADMIN
--
-- Safe to re-run — existing auth users are updated rather than duplicated,
-- and public.users roles are patched via ON CONFLICT.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Temporary table holds the desired accounts for this run only
CREATE TEMP TABLE _seed_users (
  username TEXT         PRIMARY KEY,
  password TEXT         NOT NULL,
  role     public.app_role NOT NULL
) ON COMMIT DROP;

INSERT INTO _seed_users (username, password, role) VALUES
  ('Bryan', 'testpass123', 'USER'),
  ('Admin', 'testpass123', 'ADMIN'),
  ('Damon', 'testpass123', 'USER'),
  ('Boss',  'testpass123', 'SUPER_ADMIN');

-- -----------------------------------------------------------------------------
-- Update existing auth.users rows (idempotent re-run)
-- -----------------------------------------------------------------------------
UPDATE auth.users AS au
SET
  encrypted_password = crypt(su.password, gen_salt('bf')),
  email_confirmed_at = COALESCE(au.email_confirmed_at, NOW()),
  raw_app_meta_data  = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = jsonb_build_object('username', su.username),
  updated_at         = NOW()
FROM _seed_users su
WHERE au.email = lower(su.username) || '@app.local';

-- -----------------------------------------------------------------------------
-- Insert new auth.users rows for accounts that don't exist yet
-- -----------------------------------------------------------------------------
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT
  '00000000-0000-0000-0000-000000000000'::uuid,
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  lower(su.username) || '@app.local',
  crypt(su.password, gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('username', su.username),
  NOW(),
  NOW(),
  '', '', '', ''
FROM _seed_users su
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE  au.email = lower(su.username) || '@app.local'
);

-- -----------------------------------------------------------------------------
-- Ensure public.users rows exist and have correct usernames (trigger may have
-- already created them; ON CONFLICT handles that gracefully)
-- -----------------------------------------------------------------------------
INSERT INTO public.users (id, username, role, created_at)
SELECT
  au.id,
  su.username,
  'USER',                       -- default; role is patched below
  COALESCE(au.created_at, NOW())
FROM _seed_users su
JOIN auth.users au ON au.email = lower(su.username) || '@app.local'
ON CONFLICT (id) DO UPDATE
  SET username = EXCLUDED.username;

-- -----------------------------------------------------------------------------
-- Patch roles (USER is the trigger default; only non-USER roles need updating)
-- -----------------------------------------------------------------------------
UPDATE public.users AS pu
SET    role = su.role
FROM   _seed_users su
JOIN   auth.users  au ON au.email = lower(su.username) || '@app.local'
WHERE  pu.id = au.id
  AND  su.role <> 'USER';

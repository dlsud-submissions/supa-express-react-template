-- =============================================================================
-- File:      supabase/seed.sql
-- Purpose:   Seed four development accounts for local testing.
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
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TEMP TABLE seed_users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  role public.app_role NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_users (username, password, role)
VALUES
  ('Bryan', 'testpass123', 'USER'),
  ('Odin', 'testpass123', 'ADMIN'),
  ('Damon', 'testpass123', 'USER'),
  ('Boss', 'testpass123', 'SUPER_ADMIN');

UPDATE auth.users AS au
SET
  encrypted_password = crypt(su.password, gen_salt('bf')),
  email_confirmed_at = COALESCE(au.email_confirmed_at, NOW()),
  raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
  raw_user_meta_data = jsonb_build_object('username', su.username),
  updated_at = NOW()
FROM seed_users su
WHERE au.email = lower(su.username) || '@app.local';

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
  '',
  '',
  '',
  ''
FROM seed_users su
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users au
  WHERE au.email = lower(su.username) || '@app.local'
);

INSERT INTO public.users (id, username, role, created_at)
SELECT
  au.id,
  su.username,
  'USER',
  COALESCE(au.created_at, NOW())
FROM seed_users su
JOIN auth.users au
  ON au.email = lower(su.username) || '@app.local'
ON CONFLICT (id) DO UPDATE
SET username = EXCLUDED.username;

UPDATE public.users AS pu
SET role = su.role
FROM seed_users su
JOIN auth.users au
  ON au.email = lower(su.username) || '@app.local'
WHERE pu.id = au.id;

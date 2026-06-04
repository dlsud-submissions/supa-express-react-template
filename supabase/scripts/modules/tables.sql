-- =============================================================================
-- Module: tables.sql
-- Purpose: Create application tables in the public schema.
-- Run via: Supabase Dashboard → SQL Editor
-- Order:   3 — run after enums.sql
-- =============================================================================

-- -----------------------------------------------------------------------------
-- public.users
-- Mirrors auth.users via DB triggers (see triggers.sql).
-- The 'id' column is a FK to auth.users — rows are created automatically
-- on signup via the on_auth_user_created trigger.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID          PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    VARCHAR(20)   UNIQUE NOT NULL,
  role        public.app_role NOT NULL DEFAULT 'USER',
  avatar_url  TEXT          DEFAULT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  last_login  TIMESTAMPTZ   DEFAULT NULL
);

COMMENT ON TABLE  public.users              IS 'Application profile rows mirrored from auth.users via DB triggers.';
COMMENT ON COLUMN public.users.username     IS 'App-facing display name. For email/password users this is set at signup. For OAuth users it is derived from provider metadata.';
COMMENT ON COLUMN public.users.avatar_url   IS 'Profile photo URL. Populated for OAuth users from raw_user_meta_data.';
COMMENT ON COLUMN public.users.last_login   IS 'Timestamp of most recent sign-in. Updated by the on_auth_user_login trigger.';

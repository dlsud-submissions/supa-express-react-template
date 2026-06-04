-- =============================================================================
-- drop-all.sql
-- Purpose:  Hard reset — tears down everything this project created.
--           USE WITH CAUTION. All data will be permanently deleted.
-- Run via:  Supabase Dashboard → SQL Editor
--
-- Drops (in reverse dependency order):
--   - Triggers on auth.users
--   - Trigger functions and helper functions
--   - RLS policies on public.users
--   - public.users table (cascades FK children)
--   - app_role enum
--   - Extensions (optional — commented out by default)
--
-- NOTE: auth.users rows are NOT dropped here. Supabase manages auth.users
--       internally. To clear auth users, use the Supabase Dashboard →
--       Authentication → Users, or the Supabase admin API.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Triggers (must be dropped before their functions)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login   ON auth.users;

-- -----------------------------------------------------------------------------
-- 2. Functions
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_login();
DROP FUNCTION IF EXISTS public.resolve_username_collision(TEXT);
DROP FUNCTION IF EXISTS public.derive_base_username(JSONB, TEXT, UUID);
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- -----------------------------------------------------------------------------
-- 3. Tables (CASCADE drops dependent objects like FK constraints)
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.users CASCADE;

-- -----------------------------------------------------------------------------
-- 4. Enum types
-- -----------------------------------------------------------------------------
DROP TYPE IF EXISTS public.app_role CASCADE;

-- -----------------------------------------------------------------------------
-- 5. Extensions (uncomment if you also want to remove these)
--    Warning: other Supabase internals may depend on pgcrypto / uuid-ossp.
--    Only uncomment if you are fully resetting the project.
-- -----------------------------------------------------------------------------
-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS pgcrypto;

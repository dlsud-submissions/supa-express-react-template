-- =============================================================================
-- Fix: Wire the missing triggers to their functions
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Recreate handle_new_user function (defensive — ensures body is correct)
--    Fires AFTER INSERT on auth.users → inserts a row into public.users
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, role, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'USER',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 2. Recreate handle_user_login function (defensive — ensures body is correct)
--    Fires AFTER UPDATE of last_sign_in_at on auth.users → updates last_login
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET last_login = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. Drop triggers first (idempotent — safe to run multiple times)
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_login   ON auth.users;

-- -----------------------------------------------------------------------------
-- 4. Create the missing triggers
-- -----------------------------------------------------------------------------

-- Fires when a new user signs up → populates public.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Fires when last_sign_in_at changes (i.e. on login) → updates last_login
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_login();

-- -----------------------------------------------------------------------------
-- 5. Backfill: sync any auth.users that already exist but have no public.users row
--    (covers users created while triggers were missing)
-- -----------------------------------------------------------------------------
INSERT INTO public.users (id, username, role, created_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)),
  'USER',
  COALESCE(au.created_at, NOW())
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
);

-- -----------------------------------------------------------------------------
-- 6. Verify — should show both triggers
-- -----------------------------------------------------------------------------
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
   OR event_object_schema = 'auth'
ORDER BY trigger_name;

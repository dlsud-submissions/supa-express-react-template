-- =============================================================================
-- Migration: 05_user_provider.sql
-- Purpose:   Track auth provider and require username completion for new
--            Google OAuth users before they enter the app.
--
-- Changes:
--   1. Add provider and username_confirmed columns to public.users
--   2. Allow authenticated users to update their own profile row
--      for username completion
--   3. Replace handle_new_user() so new Google users are created with
--      provider='google' and username_confirmed=false
--   4. Back-fill provider and username_confirmed for existing rows
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Step 1: Add profile completion columns
-- -----------------------------------------------------------------------------
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS username_confirmed BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.users.provider IS
  'Authentication provider that created the profile row, such as email or google.';

COMMENT ON COLUMN public.users.username_confirmed IS
  'Whether the user has explicitly confirmed the username shown in the app.';

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_provider_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_provider_check
  CHECK (provider IN ('email', 'google'));

-- -----------------------------------------------------------------------------
-- Step 2: Allow users to update their own username-completion fields
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- Step 3: Replace the auth signup trigger with provider-aware inserts
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_base_username      TEXT;
  v_username           TEXT;
  v_avatar_url         TEXT;
  v_provider           TEXT;
  v_username_confirmed BOOLEAN;
BEGIN
  v_base_username := public.derive_base_username(
    NEW.raw_user_meta_data,
    NEW.email,
    NEW.id
  );

  v_username := public.resolve_username_collision(v_base_username);
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');
  v_username_confirmed := v_provider <> 'google';

  INSERT INTO public.users (
    id,
    username,
    avatar_url,
    provider,
    username_confirmed
  )
  VALUES (
    NEW.id,
    v_username,
    v_avatar_url,
    v_provider,
    v_username_confirmed
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Step 4: Back-fill provider and confirmation state for existing users
-- -----------------------------------------------------------------------------
UPDATE public.users u
SET
  provider = COALESCE(
    (
      SELECT COALESCE(a.raw_app_meta_data->>'provider', 'email')
      FROM auth.users a
      WHERE a.id = u.id
    ),
    'email'
  ),
  username_confirmed = COALESCE(
    (
      SELECT CASE
        WHEN COALESCE(a.raw_app_meta_data->>'provider', 'email') = 'google'
          THEN FALSE
        ELSE TRUE
      END
      FROM auth.users a
      WHERE a.id = u.id
    ),
    TRUE
  )
WHERE u.provider IS NULL
   OR u.username_confirmed IS NULL
   OR u.provider NOT IN ('email', 'google');

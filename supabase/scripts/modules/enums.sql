-- =============================================================================
-- Module: enums.sql
-- Purpose: Define application-level enum types.
-- Run via: Supabase Dashboard → SQL Editor
-- Order:   2 — run after extensions.sql, before tables.sql
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
  END IF;
END
$$;

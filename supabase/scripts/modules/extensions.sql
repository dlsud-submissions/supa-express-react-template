-- =============================================================================
-- Module: extensions.sql
-- Purpose: Enable required PostgreSQL extensions.
-- Run via: Supabase Dashboard → SQL Editor
-- Order:   1 — run before any other module
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_salt(), crypt() — used in seed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; -- uuid_generate_v4() — optional fallback

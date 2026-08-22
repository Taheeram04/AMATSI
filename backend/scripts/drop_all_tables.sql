-- AMATSI — reset: drop all app tables (policies/indexes go with them).
-- Paste into Supabase SQL Editor and Run. auth.* (Supabase Auth) is untouched.
-- Afterwards run/paste all_migrations.sql to rebuild from scratch.

DROP TABLE IF EXISTS public.recommendations CASCADE;
DROP TABLE IF EXISTS public.weather         CASCADE;
DROP TABLE IF EXISTS public.alerts          CASCADE;
DROP TABLE IF EXISTS public.farms           CASCADE;
DROP TABLE IF EXISTS public.users           CASCADE;

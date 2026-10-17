-- Run once in Supabase SQL Editor if Offer/Find map upsert fails.
-- Adds optional map columns for building → home routes.

alter table public.routes add column if not exists from_lat double precision;
alter table public.routes add column if not exists from_lng double precision;
alter table public.routes add column if not exists to_lat double precision;
alter table public.routes add column if not exists to_lng double precision;
alter table public.routes add column if not exists distance_km numeric;
alter table public.routes add column if not exists duration_min numeric;

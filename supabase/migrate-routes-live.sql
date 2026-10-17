-- Paste once in Supabase → SQL Editor → Run
-- Fixes Live offer/find map upserts (distance_km, lat/lng, vehicle_kind).

alter table public.routes add column if not exists from_lat double precision;
alter table public.routes add column if not exists from_lng double precision;
alter table public.routes add column if not exists to_lat double precision;
alter table public.routes add column if not exists to_lng double precision;
alter table public.routes add column if not exists distance_km numeric;
alter table public.routes add column if not exists duration_min numeric;
alter table public.routes add column if not exists vehicle_kind text default 'car';

-- Refresh PostgREST schema cache (Dashboard → Settings → API → Reload, or:)
notify pgrst, 'reload schema';

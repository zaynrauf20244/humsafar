-- Run once in Supabase SQL Editor for Live DBs.
alter table public.routes add column if not exists vehicle_kind text default 'car';

-- HumSafar live schema (demo RLS: anon read/write — tighten before production)

create extension if not exists "pgcrypto";

-- Users
create table if not exists public.users (
  id text primary key,
  phone text not null unique,
  name text not null,
  photo text,
  gender text not null,
  age int,
  cnic text not null unique,
  cnic_front_name text,
  cnic_back_name text,
  cnic_status text not null default 'pending',
  cnic_reject_reason text,
  role text not null,
  active_role text not null,
  rating numeric not null default 5,
  rating_count int not null default 0,
  wallet_balance numeric not null default 0,
  vehicle jsonb,
  licence jsonb,
  emergency_contacts jsonb not null default '[]'::jsonb,
  banned boolean default false,
  dark_mode boolean default false,
  notify_push boolean,
  notify_quiet_hours boolean,
  blocked_user_ids jsonb not null default '[]'::jsonb,
  intro_seen boolean default true,
  referral_code text,
  created_at timestamptz not null default now()
);

create index if not exists users_phone_idx on public.users (phone);
create index if not exists users_cnic_idx on public.users (cnic);

-- Routes
create table if not exists public.routes (
  id text primary key,
  driver_id text not null references public.users (id) on delete cascade,
  "from" text not null,
  "to" text not null,
  from_lat double precision,
  from_lng double precision,
  to_lat double precision,
  to_lng double precision,
  distance_km numeric,
  duration_min numeric,
  direction text not null,
  time text not null,
  flex_minutes int not null default 10,
  seats_total int not null,
  seats_left int not null,
  days jsonb not null default '[]'::jsonb,
  start_date text not null,
  recurring boolean not null default true,
  category text not null default 'any',
  commute_type text not null,
  place_label text,
  vehicle_kind text not null default 'car',
  rate numeric not null,
  suggested_min numeric not null,
  suggested_max numeric not null,
  active boolean not null default true,
  paused_today boolean default false,
  created_at timestamptz not null default now()
);

-- Existing Live DBs: add map columns if missing
alter table public.routes add column if not exists from_lat double precision;
alter table public.routes add column if not exists from_lng double precision;
alter table public.routes add column if not exists to_lat double precision;
alter table public.routes add column if not exists to_lng double precision;
alter table public.routes add column if not exists distance_km numeric;
alter table public.routes add column if not exists duration_min numeric;
alter table public.routes add column if not exists vehicle_kind text default 'car';

create index if not exists routes_active_idx on public.routes (active, commute_type);

-- Bookings
create table if not exists public.bookings (
  id text primary key,
  route_id text not null references public.routes (id) on delete cascade,
  driver_id text not null references public.users (id),
  passenger_id text not null references public.users (id),
  pickup text not null,
  dropoff text not null,
  rate numeric not null,
  platform_fee numeric not null,
  status text not null,
  payment_note text not null default 'cash',
  pickup_code text not null,
  cancel_reason text,
  cash_received boolean,
  driver_rated boolean,
  passenger_rated boolean,
  chat_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings (status);

-- Chat messages (thread id = chat_id on booking)
create table if not exists public.chat_messages (
  id text primary key,
  chat_id text not null,
  booking_id text not null references public.bookings (id) on delete cascade,
  sender_id text not null,
  text text not null,
  at text not null,
  system boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_chat_idx on public.chat_messages (chat_id, created_at);

-- Wallet transactions
create table if not exists public.wallet_tx (
  id text primary key,
  user_id text not null references public.users (id) on delete cascade,
  type text not null,
  amount numeric not null,
  note text not null,
  created_at timestamptz not null default now()
);

-- SOS
create table if not exists public.sos_alerts (
  id text primary key,
  user_id text not null,
  booking_id text,
  at text not null,
  location text not null,
  status text not null default 'live',
  created_at timestamptz not null default now()
);

-- Complaints
create table if not exists public.complaints (
  id text primary key,
  from_user_id text not null,
  against_user_id text not null,
  booking_id text,
  text text not null,
  status text not null default 'open',
  admin_note text,
  created_at timestamptz not null default now()
);

-- App settings (single row)
create table if not exists public.app_settings (
  id int primary key default 1 check (id = 1),
  per_km numeric not null default 35,
  fee_percent numeric not null default 10,
  min_rate numeric not null default 150,
  max_rate numeric not null default 2000,
  signup_bonus numeric not null default 200,
  min_topup numeric not null default 200
);

insert into public.app_settings (id) values (1)
on conflict (id) do nothing;

-- Demo RLS: open for anon (testing only)
alter table public.users enable row level security;
alter table public.routes enable row level security;
alter table public.bookings enable row level security;
alter table public.chat_messages enable row level security;
alter table public.wallet_tx enable row level security;
alter table public.sos_alerts enable row level security;
alter table public.complaints enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "demo_users_all" on public.users;
create policy "demo_users_all" on public.users for all using (true) with check (true);

drop policy if exists "demo_routes_all" on public.routes;
create policy "demo_routes_all" on public.routes for all using (true) with check (true);

drop policy if exists "demo_bookings_all" on public.bookings;
create policy "demo_bookings_all" on public.bookings for all using (true) with check (true);

drop policy if exists "demo_chat_all" on public.chat_messages;
create policy "demo_chat_all" on public.chat_messages for all using (true) with check (true);

drop policy if exists "demo_wallet_all" on public.wallet_tx;
create policy "demo_wallet_all" on public.wallet_tx for all using (true) with check (true);

drop policy if exists "demo_sos_all" on public.sos_alerts;
create policy "demo_sos_all" on public.sos_alerts for all using (true) with check (true);

drop policy if exists "demo_complaints_all" on public.complaints;
create policy "demo_complaints_all" on public.complaints for all using (true) with check (true);

drop policy if exists "demo_settings_all" on public.app_settings;
create policy "demo_settings_all" on public.app_settings for all using (true) with check (true);

-- Realtime (ignore if already added)
do $$ begin
  alter publication supabase_realtime add table public.routes;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.bookings;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.chat_messages;
exception when duplicate_object then null;
end $$;

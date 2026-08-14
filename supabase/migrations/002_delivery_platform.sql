-- QuickFynd Delivery platform schema (PostgreSQL + PostGIS ready)
create extension if not exists "pgcrypto";
create extension if not exists "postgis";

create table if not exists public.companies (
  id text primary key,
  name text not null,
  slug text not null unique,
  type text not null default 'ecommerce',
  contact_email text,
  contact_phone text,
  gstin text,
  wallet_balance numeric not null default 0,
  cod_balance numeric not null default 0,
  status text not null default 'active',
  plan text not null default 'starter',
  created_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id text primary key,
  company_id text references public.companies (id),
  name text not null,
  phone text,
  pickup_line text,
  pickup_lat double precision,
  pickup_lng double precision,
  status text not null default 'active'
);

create table if not exists public.delivery_riders (
  id text primary key,
  name text not null,
  first_name text,
  phone text,
  vehicle text,
  vehicle_reg text,
  lat double precision,
  lng double precision,
  online boolean not null default false,
  duty text not null default 'offline',
  rating numeric default 5,
  acceptance_rate numeric default 100,
  zone_id text
);

create table if not exists public.deliveries (
  id text primary key,
  awb text not null unique,
  company_id text references public.companies (id),
  seller_id text,
  source text not null default 'manual',
  order_id text,
  status text not null default 'created',
  pickup jsonb not null,
  dropoff jsonb not null,
  package jsonb not null,
  payment jsonb not null,
  delivery_type text not null default 'standard',
  vehicle text not null default 'bike',
  rider_id text,
  price jsonb,
  pickup_otp text,
  delivery_otp text,
  fail_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deliveries_company_idx on public.deliveries (company_id);
create index if not exists deliveries_status_idx on public.deliveries (status);
create index if not exists deliveries_awb_idx on public.deliveries (awb);

create table if not exists public.delivery_status_history (
  id uuid primary key default gen_random_uuid(),
  delivery_id text references public.deliveries (id) on delete cascade,
  status text not null,
  note text,
  at timestamptz not null default now()
);

create table if not exists public.delivery_zones (
  id text primary key,
  country text,
  state text,
  city text,
  name text not null,
  pincodes text[],
  max_distance_km numeric,
  vehicles text[],
  same_day boolean default true,
  hours text
);

create table if not exists public.pricing_rules (
  id text primary key,
  zone_id text,
  base numeric not null,
  per_km numeric not null,
  weight_per_kg numeric not null,
  express numeric not null,
  same_day numeric not null,
  cod numeric not null
);

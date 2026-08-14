-- QF Express — run once in Supabase Dashboard → SQL Editor → Run
-- Project: https://supabase.com/dashboard/project/qcbnagqxzfewiqmoambm/sql

create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type text not null default 'ecommerce',
  contact_email text not null,
  contact_phone text default '',
  owner_name text default '',
  company_address text default '',
  gstin text,
  wallet_balance numeric not null default 0,
  cod_balance numeric not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended')),
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organizations_contact_email_idx
  on public.organizations (lower(contact_email));

create index if not exists organizations_status_idx
  on public.organizations (status);

create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations (id) on delete set null,
  awb text,
  status text default 'created',
  cod_amount numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hubs (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.riders (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_at timestamptz not null default now()
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  status text default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  status text default 'due',
  created_at timestamptz not null default now()
);

-- Dev-friendly RLS: API uses service role (bypasses RLS).
-- These policies still allow browser access if you query from the client later.
alter table public.organizations enable row level security;
alter table public.shipments enable row level security;
alter table public.hubs enable row level security;
alter table public.riders enable row level security;
alter table public.tickets enable row level security;
alter table public.invoices enable row level security;

drop policy if exists "orgs_all" on public.organizations;
create policy "orgs_all" on public.organizations
  for all using (true) with check (true);

drop policy if exists "shipments_all" on public.shipments;
create policy "shipments_all" on public.shipments
  for all using (true) with check (true);

drop policy if exists "hubs_all" on public.hubs;
create policy "hubs_all" on public.hubs for all using (true) with check (true);

drop policy if exists "riders_all" on public.riders;
create policy "riders_all" on public.riders for all using (true) with check (true);

drop policy if exists "tickets_all" on public.tickets;
create policy "tickets_all" on public.tickets for all using (true) with check (true);

drop policy if exists "invoices_all" on public.invoices;
create policy "invoices_all" on public.invoices for all using (true) with check (true);

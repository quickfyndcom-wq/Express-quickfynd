"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const SQL = `-- QF Express — run once in Supabase SQL Editor
-- https://supabase.com/dashboard/project/qcbnagqxzfewiqmoambm/sql/new

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
`;

export default function SupabaseSetupPage() {
  const [copied, setCopied] = useState(false);

  async function copySql() {
    await navigator.clipboard.writeText(SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-ink px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <BrandLogo
          variant="light"
          size="md"
          href="/"
          showExpress
          showPoweredBy={false}
        />
        <h1 className="mt-8 font-[family-name:var(--font-syne)] text-3xl font-bold">
          Create Supabase tables
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Do this once. Then merchant register and Super Admin approvals will
          work.
        </p>

        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-white/75">
          <li>
            Click{" "}
            <button
              type="button"
              onClick={copySql}
              className="font-semibold text-brand"
            >
              {copied ? "Copied!" : "Copy SQL"}
            </button>
          </li>
          <li>
            Open{" "}
            <a
              href="https://supabase.com/dashboard/project/qcbnagqxzfewiqmoambm/sql/new"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand"
            >
              Supabase SQL Editor
            </a>
          </li>
          <li>Paste → click Run</li>
          <li>
            Go back to{" "}
            <Link href="/register" className="font-semibold text-brand">
              /register
            </Link>{" "}
            and submit again
          </li>
        </ol>

        <pre className="mt-8 max-h-[420px] overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-white/80">
          {SQL}
        </pre>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copySql}
            className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white"
          >
            {copied ? "Copied!" : "Copy SQL"}
          </button>
          <a
            href="https://supabase.com/dashboard/project/qcbnagqxzfewiqmoambm/sql/new"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Open SQL Editor
          </a>
        </div>
      </div>
    </div>
  );
}

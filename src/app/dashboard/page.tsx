"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCustomerOrg } from "@/components/CustomerAuth";
import { CustomerPanel, CustomerStatGrid } from "@/components/CustomerShell";
import { companyQuery, inr } from "@/components/delivery/StatusBadge";

type Stats = {
  total: number;
  delivered: number;
  inTransit: number;
  failed: number;
  pending: number;
  successRate: number;
  codCollected: number;
};

export default function DashboardHomePage() {
  const org = useCustomerOrg();
  const company = companyQuery(org) || "quickfynd";
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/v1/deliveries?company=${company}`, { cache: "no-store" });
      const data = (await res.json()) as { stats?: Stats };
      if (!cancelled) setStats(data.stats ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [company]);

  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-[var(--gc-muted)]">
        {org?.name ?? "QuickFynd"} company console — create deliveries, dispatch riders, and settle COD.
      </p>

      <CustomerStatGrid
        items={[
          { label: "Today's deliveries", value: stats?.total ?? 0, hint: `${stats?.pending ?? 0} pending` },
          { label: "Delivered", value: stats?.delivered ?? 0, hint: `${stats?.successRate ?? 0}% success` },
          { label: "In transit", value: stats?.inTransit ?? 0, hint: `${stats?.failed ?? 0} failed` },
          { label: "COD collected", value: inr(stats?.codCollected ?? org?.codBalance ?? 0), hint: "Awaiting settlement" },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CustomerPanel className="p-6">
          <h3 className="text-base font-semibold">Create delivery</h3>
          <p className="mt-2 text-sm text-[var(--gc-muted)]">
            Pickup, drop, package, COD and vehicle — then the dispatch engine finds a rider.
          </p>
          <Link
            href="/dashboard/create"
            className="mt-5 inline-flex rounded-2xl bg-[var(--gc-accent)] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Create delivery
          </Link>
        </CustomerPanel>
        <CustomerPanel className="p-6">
          <h3 className="text-base font-semibold">Live tracking</h3>
          <p className="mt-2 text-sm text-[var(--gc-muted)]">
            Watch assigned riders and share customer tracking links.
          </p>
          <Link
            href="/dashboard/live"
            className="mt-5 inline-flex rounded-2xl bg-[var(--gc-soft)] px-4 py-2.5 text-sm font-semibold"
          >
            Open live board
          </Link>
        </CustomerPanel>
      </div>
    </div>
  );
}

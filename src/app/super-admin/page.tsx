"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPanel, AdminStatCard } from "@/components/SuperAdminShell";
import { inr } from "@/components/delivery/StatusBadge";

type LiveSummary = {
  onlineRiders: number;
  activeDeliveries: number;
  waitingAssignment: number;
  delayed: number;
  failed: number;
  delivered: number;
  successRate: number;
  codCollected: number;
};

type Company = {
  id: string;
  name: string;
  slug: string;
  status: string;
  contactEmail: string;
  plan: string;
};

export default function SuperAdminOverviewPage() {
  const [summary, setSummary] = useState<LiveSummary | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [liveRes, statsRes] = await Promise.all([
        fetch("/api/v1/ops/live", { cache: "no-store" }),
        fetch("/api/v1/stats", { cache: "no-store" }),
      ]);
      const live = (await liveRes.json()) as { summary?: LiveSummary };
      const stats = (await statsRes.json()) as { organizations?: Company[] };
      if (cancelled) return;
      setSummary(live.summary ?? null);
      setCompanies(stats.organizations ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Online riders"
          value={summary?.onlineRiders ?? "—"}
          hint="Shared delivery network"
          tone="ok"
        />
        <AdminStatCard
          label="Active deliveries"
          value={summary?.activeDeliveries ?? "—"}
          hint={`${summary?.waitingAssignment ?? 0} waiting assignment`}
          tone="teal"
        />
        <AdminStatCard
          label="Success rate"
          value={`${summary?.successRate ?? 0}%`}
          hint={`${summary?.delivered ?? 0} delivered`}
          tone="sky"
        />
        <AdminStatCard
          label="COD collected"
          value={inr(summary?.codCollected ?? 0)}
          hint={`${summary?.failed ?? 0} failed`}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminPanel
          className="lg:col-span-2"
          title="Companies on the network"
          action={
            <Link href="/super-admin/customers" className="text-sm font-semibold text-[var(--gc-accent)]">
              Manage
            </Link>
          }
        >
          <ul className="divide-y divide-[var(--gc-line)]">
            {companies.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-[var(--gc-muted)]">{c.contactEmail} · {c.plan}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </AdminPanel>

        <div className="console-hero-card soft-card flex flex-col justify-between rounded-[22px] p-5 text-white">
          <div>
            <p className="text-xs font-medium text-white/70">Live operations</p>
            <p className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
              {summary?.activeDeliveries ?? 0} moving
            </p>
            <p className="mt-1 text-sm text-white/70">
              {summary?.waitingAssignment ?? 0} still searching for a rider
            </p>
          </div>
          <Link
            href="/super-admin/live"
            className="mt-4 inline-flex w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0f766e]"
          >
            Open live map
          </Link>
        </div>
      </div>
    </div>
  );
}

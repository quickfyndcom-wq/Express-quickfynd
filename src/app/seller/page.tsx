"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConsolePanel, ConsoleStatCard } from "@/components/ConsoleShell";

type Stats = {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  codCollected: number;
};

export default function SellerHomePage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/v1/deliveries?seller=sl_warehouse", { cache: "no-store" });
      const data = (await res.json()) as { stats?: Stats };
      setStats(data.stats ?? null);
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ConsoleStatCard label="Orders" value={stats?.total ?? 0} tone="teal" />
        <ConsoleStatCard label="Ready / pending" value={stats?.pending ?? 0} tone="amber" />
        <ConsoleStatCard label="Active" value={stats?.inTransit ?? 0} tone="sky" />
        <ConsoleStatCard label="Completed" value={stats?.delivered ?? 0} tone="ok" />
      </div>
      <ConsolePanel className="p-6">
        <h3 className="font-semibold">Mark orders ready</h3>
        <p className="mt-2 text-sm text-[var(--gc-muted)]">
          Ready for pickup immediately starts nearest-rider search.
        </p>
        <Link
          href="/seller/orders"
          className="mt-4 inline-flex rounded-2xl bg-[var(--gc-accent)] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Open orders
        </Link>
      </ConsolePanel>
    </div>
  );
}

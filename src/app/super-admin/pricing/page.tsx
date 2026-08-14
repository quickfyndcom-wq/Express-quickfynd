"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/SuperAdminShell";
import { inr } from "@/components/delivery/StatusBadge";
import type { PricingRule } from "@/lib/delivery";

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/v1/pricing", { cache: "no-store" });
      const data = (await res.json()) as { rules?: PricingRule[] };
      setRules(data.rules ?? []);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--gc-muted)]">
        Configurable fare: base + per km + weight + express + COD.
      </p>
      {rules.map((r) => (
        <AdminPanel key={r.id} title={`Zone ${r.zoneId}`}>
          <dl className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
            {[
              ["Base fare", inr(r.base)],
              ["Per km", inr(r.perKm)],
              ["Weight / extra kg", inr(r.weightPerKg)],
              ["Express", inr(r.express)],
              ["Same day", inr(r.sameDay)],
              ["COD fee", inr(r.cod)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-[var(--gc-soft)] px-4 py-3">
                <dt className="text-xs text-[var(--gc-muted)]">{k}</dt>
                <dd className="mt-1 font-[family-name:var(--font-syne)] text-xl font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </AdminPanel>
      ))}
    </div>
  );
}

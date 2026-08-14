"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCustomerOrg } from "@/components/CustomerAuth";
import { CustomerPanel } from "@/components/CustomerShell";
import { OpsMap } from "@/components/delivery/OpsMap";
import { DeleteButton } from "@/components/DeleteButton";
import { StatusBadge, companyQuery } from "@/components/delivery/StatusBadge";
import type { Delivery } from "@/lib/delivery";

export default function CompanyLivePage() {
  const org = useCustomerOrg();
  const company = companyQuery(org) || "quickfynd";
  const [rows, setRows] = useState<Delivery[]>([]);
  const [riders, setRiders] = useState<
    { id: string; firstName: string; lat: number; lng: number; duty: string; online: boolean }[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [dRes, rRes] = await Promise.all([
        fetch(`/api/v1/deliveries?company=${company}&status=active`, { cache: "no-store" }),
        fetch("/api/v1/riders?online=1", { cache: "no-store" }),
      ]);
      const d = (await dRes.json()) as { deliveries?: Delivery[] };
      const r = (await rRes.json()) as { riders?: typeof riders };
      if (cancelled) return;
      setRows(d.deliveries ?? []);
      setRiders(r.riders ?? []);
    }
    void load();
    const t = setInterval(() => void load(), 2500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [company]);

  return (
    <div className="space-y-5">
      <CustomerPanel>
        <div className="p-4">
          <OpsMap riders={riders} deliveries={rows} />
        </div>
      </CustomerPanel>
      <CustomerPanel>
        <ul className="divide-y divide-[var(--gc-line)]">
          {rows.map((d) => (
            <li key={d.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-semibold">{d.awb}</p>
                <p className="text-xs text-[var(--gc-muted)]">
                  {d.drop.name} · {d.drop.line}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={d.status} />
                <Link href={`/track/${d.awb}`} className="text-sm font-semibold text-[var(--gc-accent)]">
                  Track
                </Link>
                <DeleteButton
                  onDelete={async () => {
                    await fetch(`/api/v1/deliveries/${d.awb}`, { method: "DELETE" });
                    setRows((list) => list.filter((x) => x.id !== d.id));
                  }}
                />
              </div>
            </li>
          ))}
          {rows.length === 0 ? (
            <li className="px-5 py-8 text-sm text-[var(--gc-muted)]">No active deliveries.</li>
          ) : null}
        </ul>
      </CustomerPanel>
    </div>
  );
}

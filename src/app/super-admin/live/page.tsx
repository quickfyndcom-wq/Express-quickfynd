"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminPanel, AdminStatCard } from "@/components/SuperAdminShell";
import { OpsMap } from "@/components/delivery/OpsMap";
import { DeleteButton } from "@/components/DeleteButton";
import { StatusBadge, inr } from "@/components/delivery/StatusBadge";
import type { Delivery } from "@/lib/delivery";

type LiveRider = {
  id: string;
  firstName: string;
  name: string;
  lat: number;
  lng: number;
  duty: string;
  online: boolean;
  speed: number;
  battery: number;
  vehicle: string;
  currentDelivery?: string;
  lastSeen: string;
};

type LivePayload = {
  summary: {
    onlineRiders: number;
    activeDeliveries: number;
    waitingAssignment: number;
    delayed: number;
    failed: number;
  };
  riders: LiveRider[];
  deliveries: Delivery[];
  unassigned: Delivery[];
};

export default function LiveOpsPage() {
  const [data, setData] = useState<LivePayload | null>(null);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch("/api/v1/ops/live", { cache: "no-store" });
      const json = (await res.json()) as LivePayload;
      if (!cancelled) setData(json);
    }
    void load();
    const t = setInterval(() => void load(), 2500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  const rider = data?.riders.find((r) => r.id === selected);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Online riders" value={data?.summary.onlineRiders ?? "—"} tone="ok" />
        <AdminStatCard label="Active deliveries" value={data?.summary.activeDeliveries ?? "—"} tone="teal" />
        <AdminStatCard label="Waiting assignment" value={data?.summary.waitingAssignment ?? "—"} tone="amber" />
        <AdminStatCard label="Delayed" value={data?.summary.delayed ?? "—"} tone="sky" />
        <AdminStatCard label="Failed" value={data?.summary.failed ?? "—"} tone="brand" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <AdminPanel title="Live delivery map">
          <div className="p-4">
            <OpsMap
              riders={data?.riders ?? []}
              deliveries={data?.deliveries ?? []}
              onSelect={setSelected}
              focusRiderId={selected}
            />
          </div>
        </AdminPanel>

        <AdminPanel title={rider ? rider.name : "Rider detail"}>
          {rider ? (
            <div className="space-y-2 px-5 pb-5 text-sm">
              <p><span className="text-[var(--gc-muted)]">Duty</span> · {rider.duty}</p>
              <p><span className="text-[var(--gc-muted)]">Vehicle</span> · {rider.vehicle}</p>
              <p><span className="text-[var(--gc-muted)]">Speed</span> · {rider.speed} km/h</p>
              <p><span className="text-[var(--gc-muted)]">Battery</span> · {rider.battery}%</p>
              <p><span className="text-[var(--gc-muted)]">Current</span> · {rider.currentDelivery ?? "—"}</p>
              <p className="text-xs text-[var(--gc-muted)]">Last seen {new Date(rider.lastSeen).toLocaleTimeString()}</p>
            </div>
          ) : (
            <p className="px-5 pb-5 text-sm text-[var(--gc-muted)]">
              Click a rider on the map.
            </p>
          )}
        </AdminPanel>
      </div>

      <AdminPanel title="Waiting assignment">
        <ul className="divide-y divide-[var(--gc-line)]">
          {(data?.unassigned ?? []).map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-sm font-semibold">{d.awb}</p>
                <p className="text-xs text-[var(--gc-muted)]">
                  {d.pickup.name} → {d.drop.name} · {inr(d.price.total)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={d.status} />
                <Link href={`/track/${d.awb}`} className="text-sm font-semibold text-[var(--gc-accent)]">
                  Track
                </Link>
                <DeleteButton
                  onDelete={async () => {
                    await fetch(`/api/v1/deliveries/${d.awb}`, { method: "DELETE" });
                    setData((prev) =>
                      prev
                        ? {
                            ...prev,
                            unassigned: prev.unassigned.filter((x) => x.id !== d.id),
                          }
                        : prev,
                    );
                  }}
                />
              </div>
            </li>
          ))}
          {(data?.unassigned ?? []).length === 0 ? (
            <li className="px-5 py-8 text-sm text-[var(--gc-muted)]">All deliveries are assigned.</li>
          ) : null}
        </ul>
      </AdminPanel>
    </div>
  );
}

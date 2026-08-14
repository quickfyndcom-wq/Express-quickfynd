"use client";

import { useEffect, useState } from "react";
import { AdminPanel, AdminStatCard } from "@/components/SuperAdminShell";
import { DeleteButton } from "@/components/DeleteButton";

type Rider = {
  id: string;
  name: string;
  firstName: string;
  vehicle: string;
  vehicleReg?: string;
  online: boolean;
  duty: string;
  rating: number;
  acceptanceRate: number;
  todayEarnings: number;
  todayDeliveries: number;
  activeDeliveries: number;
  battery: number;
};

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/v1/riders", { cache: "no-store" });
      const data = (await res.json()) as { riders?: Rider[] };
      if (!cancelled) setRiders(data.riders ?? []);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const online = riders.filter((r) => r.online).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <AdminStatCard label="Partners" value={riders.length} tone="teal" />
        <AdminStatCard label="Online" value={online} tone="ok" />
        <AdminStatCard label="Offline" value={riders.length - online} tone="slate" />
      </div>
      <AdminPanel title="Delivery partners">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[var(--gc-soft)] text-[11px] uppercase tracking-wider text-[var(--gc-muted)]">
              <tr>
                <th className="px-4 py-3">Rider</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Duty</th>
                <th className="px-4 py-3">Today</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {riders.map((r) => (
                <tr key={r.id} className="border-t border-[var(--gc-line)]">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-[11px] text-[var(--gc-muted)]">{r.id}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {r.vehicle}
                    <p className="text-[11px] text-[var(--gc-muted)]">{r.vehicleReg}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={r.online ? "text-emerald-700" : "text-slate-500"}>
                      {r.online ? "Online" : "Offline"} · {r.duty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    ₹{r.todayEarnings} · {r.todayDeliveries} trips
                  </td>
                  <td className="px-4 py-3">
                    {r.rating} ★ · {r.acceptanceRate}% accept
                  </td>
                  <td className="px-4 py-3">
                    <DeleteButton
                      onDelete={async () => {
                        await fetch(`/api/v1/riders?id=${r.id}`, { method: "DELETE" });
                        setRiders((list) => list.filter((x) => x.id !== r.id));
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  );
}

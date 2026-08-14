"use client";

import { useEffect, useState } from "react";
import { AdminPanel } from "@/components/SuperAdminShell";
import { DeleteButton } from "@/components/DeleteButton";
import type { Zone } from "@/lib/delivery";

export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/v1/zones", { cache: "no-store" });
      const data = (await res.json()) as { zones?: Zone[] };
      setZones(data.zones ?? []);
    })();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {zones.map((z) => (
        <AdminPanel key={z.id} title={z.name}>
          <div className="space-y-1 px-5 pb-5 text-sm text-[var(--gc-muted)]">
            <p>{z.country} · {z.state} · {z.city}</p>
            <p>Pincodes: {z.pincodes.join(", ")}</p>
            <p>Max distance: {z.maxDistanceKm} km</p>
            <p>Hours: {z.hours}</p>
            <p>Vehicles: {z.vehicles.join(", ")}</p>
            <p>Same day: {z.sameDay ? "Yes" : "No"}</p>
            <div className="pt-3">
              <DeleteButton
                onDelete={async () => {
                  await fetch(`/api/v1/zones?id=${z.id}`, { method: "DELETE" });
                  setZones((list) => list.filter((x) => x.id !== z.id));
                }}
              />
            </div>
          </div>
        </AdminPanel>
      ))}
    </div>
  );
}

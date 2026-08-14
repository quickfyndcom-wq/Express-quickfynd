"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OpsMap } from "./OpsMap";
import { StatusBadge, inr } from "./StatusBadge";
import type { Delivery } from "@/lib/delivery";

type TrackPayload = {
  ok?: boolean;
  awb?: string;
  status?: string;
  consignee?: string;
  destination?: string;
  remainingKm?: number;
  etaMinutes?: number;
  stopsBefore?: number;
  rider?: {
    id: string;
    firstName: string;
    lat: number;
    lng: number;
    duty: string;
    online: boolean;
    vehicle: string;
    vehicleReg?: string;
    rating: number;
    speed: number;
    heading?: number;
  } | null;
  timeline?: { status: string; label: string; done: boolean }[];
  delivery?: Delivery;
  error?: string;
};

export function LiveTrackView({ awb }: { awb: string }) {
  const [data, setData] = useState<TrackPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/v1/track/${encodeURIComponent(awb)}`, { cache: "no-store" });
      const json = (await res.json()) as TrackPayload;
      if (!cancelled) setData(json);
    }
    void load();
    const t = setInterval(() => void load(), 2500);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [awb]);

  if (!data) {
    return <p className="text-sm text-muted">Loading live tracking…</p>;
  }
  if (!data.ok) {
    return (
      <p className="text-sm text-muted">
        No live record for {awb}. Try a seeded AWB such as QFD12345601.
      </p>
    );
  }

  const d = data.delivery;
  const rider = data.rider;

  return (
    <div className="space-y-8">
      <div className="inline-flex items-center gap-2 rounded-md bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
        <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
        {data.status?.replaceAll("_", " ")}
        {typeof data.remainingKm === "number" ? ` · ${data.remainingKm} km away` : ""}
      </div>

      {typeof data.etaMinutes === "number" ? (
        <p className="text-muted">
          Estimated arrival {data.etaMinutes} minutes
          {data.stopsBefore ? ` · ${data.stopsBefore} stop${data.stopsBefore === 1 ? "" : "s"} before you` : data.stopsBefore === 0 && rider ? " · You're next!" : ""}
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-8">
          <ol className="relative space-y-0 border-l border-line pl-6">
            {(data.timeline ?? []).map((event) => (
              <li key={event.status} className="relative pb-8 last:pb-0">
                <span
                  className={`absolute -left-[1.9rem] top-1 h-3.5 w-3.5 rounded-full border-2 ${
                    event.done ? "border-brand bg-brand" : "border-line bg-paper"
                  }`}
                />
                <h2 className={`font-[family-name:var(--font-syne)] text-lg font-bold ${event.done ? "text-ink" : "text-muted"}`}>
                  {event.label}
                </h2>
              </li>
            ))}
          </ol>

          {d ? (
            <OpsMap
              riders={rider ? [rider] : []}
              deliveries={[d]}
              focusRiderId={rider?.id}
            />
          ) : null}
        </div>

        <aside className="h-fit space-y-5 border border-line bg-mist p-6">
          {rider ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Delivery partner</p>
              <p className="mt-2 font-[family-name:var(--font-syne)] text-xl font-bold">{rider.firstName}</p>
              <p className="text-sm text-muted capitalize">
                {rider.vehicle} · {rider.vehicleReg} · {rider.rating} ★
              </p>
              <p className="mt-2 text-sm">{rider.speed} km/h · {rider.online ? "Online" : "Offline"}</p>
            </div>
          ) : (
            <p className="text-sm text-muted">Rider will appear here after assignment.</p>
          )}
          {d ? (
            <div className="border-t border-line pt-4 text-sm">
              <p><strong>Pickup</strong> {d.pickup.line}</p>
              <p className="mt-2"><strong>Drop</strong> {d.drop.line}</p>
              <p className="mt-2"><strong>Package</strong> {d.package.type} · {d.package.weightKg} kg</p>
              <p className="mt-2"><strong>Charge</strong> {inr(d.price.total)}</p>
              <StatusBadge status={d.status} />
            </div>
          ) : null}
          <Link href="/logistics" className="inline-block text-sm font-semibold text-brand">
            Book another delivery
          </Link>
        </aside>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Delivery, DeliveryStatus } from "@/lib/delivery";
import { DeleteButton } from "@/components/DeleteButton";
import { StatusBadge, inr } from "./StatusBadge";

type Stats = {
  total: number;
  delivered: number;
  inTransit: number;
  pending: number;
  failed: number;
  successRate: number;
  codCollected: number;
};

const FILTERS: { id: string; label: string; status?: DeliveryStatus | "active" | "unassigned" }[] = [
  { id: "all", label: "All" },
  { id: "unassigned", label: "Unassigned", status: "unassigned" },
  { id: "searching_rider", label: "Searching", status: "searching_rider" },
  { id: "active", label: "Active", status: "active" },
  { id: "out_for_delivery", label: "In transit", status: "out_for_delivery" },
  { id: "delivered", label: "Delivered", status: "delivered" },
  { id: "failed", label: "Failed", status: "failed" },
];

export function DeliveryBoard({
  company,
  admin,
  source,
}: {
  company?: string;
  admin?: boolean;
  source?: string;
}) {
  const [status, setStatus] = useState<string>("all");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const filter = FILTERS.find((f) => f.id === status);
    const params = new URLSearchParams();
    if (company) params.set("company", company);
    if (source) params.set("source", source);
    if (filter?.status) params.set("status", filter.status);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/v1/deliveries?${params}`, { cache: "no-store" });
    const data = (await res.json()) as {
      deliveries?: Delivery[];
      stats?: Stats;
      error?: string;
    };
    if (!res.ok) {
      setError(data.error ?? "Failed to load deliveries");
      return;
    }
    setError("");
    setRows(data.deliveries ?? []);
    setStats(data.stats ?? null);
  }, [company, source, status, q]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 20000);
    return () => clearInterval(t);
  }, [load]);

  async function act(path: string, body?: Record<string, unknown>) {
    setBusy(path);
    try {
      await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      await load();
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-5">
      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Today / total", stats.total],
            ["In transit", stats.inTransit],
            ["Unassigned", stats.pending],
            ["Success", `${stats.successRate}%`],
          ].map(([label, value]) => (
            <div key={String(label)} className="console-card soft-card rounded-[22px] bg-white p-4">
              <p className="text-xs text-[var(--gc-muted)]">{label}</p>
              <p className="mt-1 font-[family-name:var(--font-syne)] text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setStatus(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === f.id
                ? "bg-[var(--gc-accent)] text-white"
                : "bg-white text-[var(--gc-ink-soft)]"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search AWB, customer, order"
          className="ml-auto w-full rounded-full border border-[var(--gc-line)] bg-white px-4 py-2 text-sm sm:w-64"
        />
      </div>

      {error ? <p className="text-sm text-brand">{error}</p> : null}

      <div className="soft-card overflow-hidden rounded-[22px] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[var(--gc-soft)] text-[11px] uppercase tracking-wider text-[var(--gc-muted)]">
              <tr>
                <th className="px-4 py-3">AWB</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Pickup → Drop</th>
                <th className="px-4 py-3">Pay</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[var(--gc-muted)]">
                    No deliveries in this view.
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="border-t border-[var(--gc-line)]">
                    <td className="px-4 py-3">
                      <Link href={`/track/${d.awb}`} className="font-semibold text-[var(--gc-accent)]">
                        {d.awb}
                      </Link>
                      <p className="text-[11px] text-[var(--gc-muted)]">{d.orderId ?? d.source}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{d.drop.name}</p>
                      <p className="text-[11px] text-[var(--gc-muted)]">{d.drop.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--gc-muted)]">
                      {d.pickup.line} → {d.drop.line}
                      <p>{d.price.distanceKm} km · {inr(d.price.total)}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {d.payment.type === "cod" ? `COD ${inr(d.payment.amount)}` : "Prepaid"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.status} />
                      {d.riderId ? (
                        <p className="mt-1 text-[11px] text-[var(--gc-muted)]">{d.riderId}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          disabled={busy !== ""}
                          onClick={() => act(`/api/v1/deliveries/${d.awb}/dispatch`)}
                          className="rounded-full bg-[var(--gc-soft)] px-2.5 py-1 text-[11px] font-semibold"
                        >
                          Dispatch
                        </button>
                        {admin ? (
                          <button
                            type="button"
                            disabled={busy !== ""}
                            onClick={() => act(`/api/v1/deliveries/${d.awb}/status`)}
                            className="rounded-full bg-[var(--gc-soft)] px-2.5 py-1 text-[11px] font-semibold"
                          >
                            Advance
                          </button>
                        ) : null}
                        {d.offeredRiderId ? (
                          <button
                            type="button"
                            disabled={busy !== ""}
                            onClick={() =>
                              act(`/api/v1/deliveries/${d.awb}/accept`, {
                                riderId: d.offeredRiderId,
                              })
                            }
                            className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                          >
                            Accept offer
                          </button>
                        ) : null}
                        <DeleteButton
                          busy={busy === d.awb}
                          onDelete={async () => {
                            setBusy(d.awb);
                            await fetch(`/api/v1/deliveries/${d.awb}`, { method: "DELETE" });
                            await load();
                            setBusy("");
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

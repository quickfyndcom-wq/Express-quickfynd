"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { StatusBadge } from "@/components/delivery/StatusBadge";
import type { Delivery } from "@/lib/delivery";

export default function SellerOrdersPage() {
  const [rows, setRows] = useState<Delivery[]>([]);
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/deliveries?company=quickfynd", { cache: "no-store" });
    const data = (await res.json()) as { deliveries?: Delivery[] };
    setRows(data.deliveries ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function ready(awb: string) {
    setBusy(awb);
    await fetch(`/api/v1/deliveries/${awb}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ready_for_pickup" }),
    });
    await fetch(`/api/v1/deliveries/${awb}/dispatch`, { method: "POST" });
    await load();
    setBusy("");
  }

  return (
    <div className="soft-card overflow-hidden rounded-[22px] bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-[var(--gc-soft)] text-[11px] uppercase tracking-wider text-[var(--gc-muted)]">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id} className="border-t border-[var(--gc-line)]">
              <td className="px-4 py-3">
                <Link href={`/track/${d.awb}`} className="font-semibold text-[var(--gc-accent)]">
                  {d.awb}
                </Link>
                <p className="text-[11px] text-[var(--gc-muted)]">{d.orderId}</p>
              </td>
              <td className="px-4 py-3">{d.drop.name}</td>
              <td className="px-4 py-3">
                <StatusBadge status={d.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy === d.awb}
                    onClick={() => ready(d.awb)}
                    className="rounded-full bg-[var(--gc-accent)] px-3 py-1.5 text-[11px] font-semibold text-white"
                  >
                    Ready for pickup
                  </button>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

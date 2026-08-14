"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";
import { StatusBadge, inr } from "@/components/delivery/StatusBadge";

type Booking = {
  awb: string;
  status: string;
  pickup: { line: string };
  drop: { line: string };
  vehicle: string;
  price: { total: number };
  rider: { firstName: string } | null;
};

export default function LogisticsActivityPage() {
  const [phone, setPhone] = useState("");
  const [tab, setTab] = useState<"active" | "all">("active");
  const [rows, setRows] = useState<Booking[]>([]);
  const [note, setNote] = useState("Enter the pickup or receiver mobile used at booking.");

  async function load() {
    const params = new URLSearchParams();
    if (phone.trim()) params.set("phone", phone.trim());
    if (tab === "active") params.set("status", "active");
    const res = await fetch(`/api/v1/logistics/book?${params}`);
    const data = (await res.json()) as { bookings?: Booking[] };
    setRows(data.bookings ?? []);
    setNote(data.bookings?.length ? "" : "No bookings for this number yet.");
  }

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <BrandLogo variant="dark" size="sm" />
          <Link href="/logistics" className="text-sm font-semibold text-brand">
            New booking
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <h1 className="font-[family-name:var(--font-syne)] text-3xl font-bold">Activity</h1>
        <div className="mt-6 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-line px-3 py-2.5 text-sm"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Look up
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          {(["active", "all"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
              }}
              className={`rounded-full px-3 py-1 text-sm ${tab === t ? "bg-brand text-white" : "border border-line"}`}
            >
              {t === "active" ? "Ongoing" : "All"}
            </button>
          ))}
        </div>
        {note ? <p className="mt-4 text-sm text-muted">{note}</p> : null}
        <ul className="mt-6 space-y-3">
          {rows.map((b) => (
            <li key={b.awb} className="rounded-2xl border border-line bg-white px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{b.awb}</p>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {b.pickup.line} → {b.drop.line} · {b.vehicle} · {inr(b.price.total)}
                {b.rider ? ` · ${b.rider.firstName}` : ""}
              </p>
              <Link href={`/track/${b.awb}`} className="mt-2 inline-block text-sm font-semibold text-brand">
                Track live
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

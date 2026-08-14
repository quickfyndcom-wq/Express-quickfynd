"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";
import { inr } from "@/components/delivery/StatusBadge";
import { GOODS_TYPES, LOGISTICS_SERVICES, PLACES } from "@/lib/delivery/catalog";

type Partner = {
  id: string;
  firstName: string;
  rating: number;
  vehicle: string;
  distanceKm: number;
  pickupEtaMin: number;
  completedTrips: number;
};

type Fare = {
  vehicle: string;
  recommended?: boolean;
  pickupEtaMin: number;
  deliveryEtaMin: number;
  price: {
    base: number;
    distance: number;
    platformFee: number;
    total: number;
    distanceKm: number;
    riderEarning: number;
  };
};

type PlaceKey = keyof typeof PLACES;

const STEPS = [
  "Service",
  "Pickup",
  "Drop",
  "Goods",
  "Partners",
  "Confirm",
] as const;

const inputCls =
  "mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-brand";

export function LogisticsWizard() {
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("bike");
  const [pickupKey, setPickupKey] = useState<PlaceKey>("Kozhikode");
  const [dropKey, setDropKey] = useState<PlaceKey>("Feroke");
  const [pickupName, setPickupName] = useState("Warehouse desk");
  const [pickupPhone, setPickupPhone] = useState("9876500001");
  const [pickupNote, setPickupNote] = useState("Call when you reach the gate.");
  const [dropName, setDropName] = useState("Receiver");
  const [dropPhone, setDropPhone] = useState("9745001100");
  const [dropNote, setDropNote] = useState("");
  const [stops, setStops] = useState<PlaceKey[]>([]);
  const [goods, setGoods] = useState("Electronics");
  const [weight, setWeight] = useState(2);
  const [count, setCount] = useState(1);
  const [fragile, setFragile] = useState(true);
  const [vehicle, setVehicle] = useState("bike");
  const [assignMode, setAssignMode] = useState<"quick" | "choose">("quick");
  const [preferredRiderId, setPreferredRiderId] = useState("");
  const [payment, setPayment] = useState("upi");
  const [quotes, setQuotes] = useState<Fare[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [nearbyMeta, setNearbyMeta] = useState({
    available: 0,
    nearestKm: null as number | null,
    nearestEtaMin: null as number | null,
    averagePickupMin: 0,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [awb, setAwb] = useState("");
  const [searching, setSearching] = useState(false);

  const pickup = PLACES[pickupKey];
  const drop = PLACES[dropKey];
  const service = LOGISTICS_SERVICES.find((s) => s.id === serviceId) ?? LOGISTICS_SERVICES[0];
  const fare = quotes.find((q) => q.vehicle === vehicle) ?? quotes[0];

  const summary = useMemo(
    () => ({
      pickup: pickup.label,
      drop: drop.label,
      distance: fare?.price.distanceKm,
      vehicle,
      goods,
      mode: assignMode === "quick" ? "Quick Assign" : "Choose partner",
    }),
    [pickup.label, drop.label, fare?.price.distanceKm, vehicle, goods, assignMode],
  );

  async function loadQuoteAndNearby(nextVehicle = vehicle) {
    setBusy(true);
    setError("");
    try {
      const [qRes, nRes] = await Promise.all([
        fetch("/api/v1/logistics/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickup,
            drop,
            weightKg: weight,
            goods,
            vehicle: nextVehicle,
            deliveryType: "express",
          }),
        }),
        fetch("/api/v1/logistics/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: pickup.lat, lng: pickup.lng, vehicle: nextVehicle }),
        }),
      ]);
      const qData = (await qRes.json()) as { quotes?: Fare[]; recommended?: string };
      const nData = (await nRes.json()) as {
        available?: number;
        nearestKm?: number;
        nearestEtaMin?: number;
        averagePickupMin?: number;
        partners?: Partner[];
      };
      setQuotes(qData.quotes ?? []);
      if (qData.recommended) setVehicle(qData.recommended);
      setPartners(nData.partners ?? []);
      setNearbyMeta({
        available: nData.available ?? 0,
        nearestKm: nData.nearestKm ?? null,
        nearestEtaMin: nData.nearestEtaMin ?? null,
        averagePickupMin: nData.averagePickupMin ?? 0,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load availability");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/v1/logistics/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: {
            name: pickupName,
            phone: pickupPhone,
            line: pickup.label,
            city: "Kozhikode",
            pincode: pickup.pincode,
            lat: pickup.lat,
            lng: pickup.lng,
            instructions: pickupNote,
          },
          drop: {
            name: dropName,
            phone: dropPhone,
            line: drop.label,
            city: "Kozhikode",
            pincode: drop.pincode,
            lat: drop.lat,
            lng: drop.lng,
            instructions: dropNote,
          },
          stops: stops.map((k) => PLACES[k]),
          goods,
          weightKg: weight,
          packages: count,
          fragile,
          vehicle,
          assignMode,
          preferredRiderId: assignMode === "choose" ? preferredRiderId : undefined,
          payment: { type: payment === "cash" ? "cod" : "prepaid" },
        }),
      });
      const data = (await res.json()) as { ok?: boolean; awb?: string; error?: string };
      if (!data.ok || !data.awb) {
        setError(data.error ?? "Booking failed");
        return;
      }
      setAwb(data.awb);
      setSearching(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  async function findAnother() {
    await fetch("/api/v1/logistics/request-rider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ awb, mode: "quick", findAnother: true }),
    });
  }

  if (awb && searching) {
    return (
      <Shell>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Finding a delivery partner
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
          Searching nearby riders
        </h1>
        <div className="mt-6 space-y-2 text-sm text-muted">
          <p>● 1 KM</p>
          <p>● 2 KM</p>
          <p>● 3 KM</p>
        </div>
        <p className="mt-6 text-sm">
          AWB <span className="font-semibold">{awb}</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/track/${awb}`}
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white"
          >
            Track live
          </Link>
          <button
            type="button"
            onClick={() => void findAnother()}
            className="rounded-xl border border-line px-5 py-3 text-sm font-semibold"
          >
            Find another partner
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
        QuickFynd Logistics
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
        Deliver anything. Anywhere.
      </h1>
      <p className="mt-2 text-sm text-muted">
        Anyone can book — individuals, shops, sellers, restaurants, warehouses.
        No ecommerce order required.
      </p>

      <ol className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-full px-3 py-1 ${
              i === step ? "bg-brand text-white" : i < step ? "bg-mist" : "bg-white border border-line"
            }`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold">What do you want to move?</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {LOGISTICS_SERVICES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setServiceId(s.id);
                  setVehicle(s.vehicles[0]);
                }}
                className={`rounded-2xl border px-4 py-4 text-left ${
                  serviceId === s.id ? "border-brand bg-brand/5" : "border-line bg-white"
                }`}
              >
                <p className="text-xl">
                  {s.emoji} {s.name}
                </p>
                <p className="mt-1 text-sm text-muted">{s.blurb}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-bold">Where should we pick up?</h2>
          <label className="block text-sm">
            Pickup area
            <select
              className={inputCls}
              value={pickupKey}
              onChange={(e) => setPickupKey(e.target.value as PlaceKey)}
            >
              {(Object.keys(PLACES) as PlaceKey[]).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Contact name
            <input className={inputCls} value={pickupName} onChange={(e) => setPickupName(e.target.value)} />
          </label>
          <label className="block text-sm">
            Mobile
            <input className={inputCls} value={pickupPhone} onChange={(e) => setPickupPhone(e.target.value)} />
          </label>
          <label className="block text-sm">
            Pickup instructions
            <input className={inputCls} value={pickupNote} onChange={(e) => setPickupNote(e.target.value)} />
          </label>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-bold">Where should we deliver?</h2>
          <label className="block text-sm">
            Drop area
            <select
              className={inputCls}
              value={dropKey}
              onChange={(e) => setDropKey(e.target.value as PlaceKey)}
            >
              {(Object.keys(PLACES) as PlaceKey[]).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            Receiver name
            <input className={inputCls} value={dropName} onChange={(e) => setDropName(e.target.value)} />
          </label>
          <label className="block text-sm">
            Receiver mobile
            <input className={inputCls} value={dropPhone} onChange={(e) => setDropPhone(e.target.value)} />
          </label>
          <label className="block text-sm">
            Delivery instructions
            <input className={inputCls} value={dropNote} onChange={(e) => setDropNote(e.target.value)} />
          </label>
          <button
            type="button"
            className="text-sm font-semibold text-brand"
            onClick={() => setStops((s) => [...s, "Palayam"])}
          >
            + Add another stop
          </button>
          {stops.length ? (
            <p className="text-sm text-muted">Stops: {stops.join(" → ")}</p>
          ) : null}
        </section>
      ) : null}

      {step === 3 ? (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-bold">What are you sending?</h2>
          <div className="flex flex-wrap gap-2">
            {GOODS_TYPES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoods(g)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  goods === g ? "bg-brand text-white" : "border border-line"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Packages
              <input
                type="number"
                className={inputCls}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <label className="text-sm">
              Weight (kg)
              <input
                type="number"
                className={inputCls}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={fragile} onChange={(e) => setFragile(e.target.checked)} />
            Fragile / handle with care
          </label>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="mt-8 space-y-5">
          <h2 className="text-lg font-bold">Partners near you</h2>
          <p className="text-sm text-muted">
            {nearbyMeta.available} riders available
            {nearbyMeta.nearestKm != null
              ? ` · nearest ${nearbyMeta.nearestKm} km · pickup ${nearbyMeta.nearestEtaMin} min`
              : ""}
          </p>
          {quotes.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {quotes.slice(0, 4).map((q) => (
                <button
                  key={q.vehicle}
                  type="button"
                  onClick={() => {
                    setVehicle(q.vehicle);
                    void loadQuoteAndNearby(q.vehicle);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left ${
                    vehicle === q.vehicle ? "border-brand bg-brand/5" : "border-line"
                  }`}
                >
                  <p className="font-semibold capitalize">
                    {q.recommended ? "Recommended · " : ""}
                    {q.vehicle}
                  </p>
                  <p className="text-sm text-muted">{inr(q.price.total)}</p>
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => setAssignMode("quick")}
            className={`w-full rounded-2xl border px-4 py-4 text-left ${
              assignMode === "quick" ? "border-brand bg-brand/5" : "border-line"
            }`}
          >
            <p className="font-bold">⚡ Fastest — Find My Driver</p>
            <p className="mt-1 text-sm text-muted">
              QuickFynd assigns the best nearby partner. Pickup ETA{" "}
              {nearbyMeta.nearestEtaMin ?? 3}–{(nearbyMeta.averagePickupMin || 4) + 2} minutes.
            </p>
          </button>
          <p className="text-sm font-semibold">Or choose a delivery partner</p>
          <div className="space-y-2">
            {partners.slice(0, 5).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setAssignMode("choose");
                  setPreferredRiderId(p.id);
                }}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                  preferredRiderId === p.id && assignMode === "choose"
                    ? "border-brand bg-brand/5"
                    : "border-line"
                }`}
              >
                <div>
                  <p className="font-semibold">
                    {p.firstName} · ⭐ {p.rating}
                  </p>
                  <p className="text-xs text-muted">
                    {p.vehicle} · {p.distanceKm} km · ETA {p.pickupEtaMin} min · {p.completedTrips} trips
                  </p>
                </div>
                <span className="text-xs font-semibold text-brand">SELECT</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 5 ? (
        <section className="mt-8 space-y-4">
          <h2 className="text-lg font-bold">Confirm booking</h2>
          <div className="rounded-2xl bg-mist px-4 py-4 text-sm leading-7">
            <p>Pickup {summary.pickup}</p>
            <p>Drop {summary.drop}</p>
            {fare ? <p>Distance {fare.price.distanceKm} KM</p> : null}
            <p>Vehicle {vehicle}</p>
            <p>Package {goods}</p>
            <p>Partner {summary.mode}</p>
            {fare ? (
              <>
                <p>Pickup ETA {fare.pickupEtaMin} minutes</p>
                <p>Delivery ETA {fare.deliveryEtaMin} minutes</p>
                <p>
                  Base {inr(fare.price.base)} · Distance {inr(fare.price.distance)} · Platform{" "}
                  {inr(fare.price.platformFee)}
                </p>
                <p className="text-base font-bold">Total {inr(fare.price.total)}</p>
              </>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {["upi", "card", "wallet", "cash", "business"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPayment(p)}
                className={`rounded-full px-3 py-1.5 text-sm capitalize ${
                  payment === p ? "bg-brand text-white" : "border border-line"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {error ? <p className="mt-4 text-sm text-brand">{error}</p> : null}

      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <button
            type="button"
            className="rounded-xl border border-line px-5 py-3 text-sm font-semibold"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        ) : null}
        {step < 5 ? (
          <button
            type="button"
            disabled={busy}
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() => {
              const next = step + 1;
              setStep(next);
              if (next === 4) void loadQuoteAndNearby(service.vehicles[0]);
            }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={busy}
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() => void confirm()}
          >
            {busy ? "Booking…" : "Confirm booking"}
          </button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <BrandLogo variant="dark" size="sm" />
          <div className="flex gap-4 text-sm font-semibold">
            <Link href="/logistics/activity" className="text-neutral-700">
              Activity
            </Link>
            <Link href="/track" className="text-brand">
              Track
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">{children}</main>
      <Footer />
    </div>
  );
}

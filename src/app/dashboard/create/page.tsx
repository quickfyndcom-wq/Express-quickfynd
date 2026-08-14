"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CustomerPanel } from "@/components/CustomerShell";
import { useCustomerOrg } from "@/components/CustomerAuth";
import { companyQuery, inr } from "@/components/delivery/StatusBadge";

type Quote = {
  total: number;
  distanceKm: number;
  base: number;
  distance: number;
  weight: number;
  express: number;
  cod: number;
  riderEarning: number;
};

export default function CreateDeliveryPage() {
  const org = useCustomerOrg();
  const [note, setNote] = useState("");
  const [awb, setAwb] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setNote("");
    const form = new FormData(e.currentTarget);
    const payload = {
      companyId: companyQuery(org) || "quickfynd",
      source: "manual",
      orderId: String(form.get("ref") || ""),
      pickup: {
        name: String(form.get("pickupName")),
        phone: String(form.get("pickupPhone")),
        line: String(form.get("pickupAddress")),
        lat: Number(form.get("pickupLat") || 11.2588),
        lng: Number(form.get("pickupLng") || 75.7804),
      },
      customer: {
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        address: String(form.get("address")),
        pincode: String(form.get("pincode")),
        lat: Number(form.get("dropLat") || 11.2655),
        lng: Number(form.get("dropLng") || 75.79),
      },
      package: {
        type: String(form.get("packageType") || "parcel"),
        weightKg: Number(form.get("weight") || 1),
        count: Number(form.get("count") || 1),
        fragile: form.get("fragile") === "on",
        instructions: String(form.get("instructions") || ""),
      },
      payment: {
        type: String(form.get("pay") || "prepaid"),
        amount: Number(form.get("cod") || 0),
      },
      deliveryType: String(form.get("dtype") || "standard"),
      vehicle: String(form.get("vehicle") || "bike"),
      autoDispatch: true,
    };

    const res = await fetch("/api/v1/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      awb?: string;
      trackingUrl?: string;
      price?: Quote;
      error?: string;
    };
    setBusy(false);
    if (!res.ok || !data.ok) {
      setNote(data.error ?? "Could not create delivery");
      return;
    }
    setAwb(data.awb ?? "");
    setQuote(data.price ?? null);
    setNote(`Delivery created. Rider search started.`);
  }

  async function previewQuote(e: FormEvent<HTMLFormElement>) {
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/v1/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickup: { lat: Number(form.get("pickupLat") || 11.2588), lng: Number(form.get("pickupLng") || 75.7804) },
        drop: { lat: Number(form.get("dropLat") || 11.2655), lng: Number(form.get("dropLng") || 75.79) },
        weightKg: Number(form.get("weight") || 1),
        deliveryType: String(form.get("dtype") || "standard"),
        paymentType: String(form.get("pay") || "prepaid"),
        vehicle: String(form.get("vehicle") || "bike"),
      }),
    });
    const data = (await res.json()) as { price?: Quote };
    setQuote(data.price ?? null);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight">
          Create delivery
        </h2>
        <p className="mt-2 text-sm text-[var(--gc-muted)]">
          Manual booking for {org?.name ?? "your company"}. Dispatch starts as soon as you confirm.
        </p>
      </div>

      <CustomerPanel className="overflow-hidden">
        <form
          onSubmit={onSubmit}
          onChange={(e) => void previewQuote(e)}
          className="space-y-6 p-6"
        >
          <section className="grid gap-4 md:grid-cols-2">
            <h3 className="md:col-span-2 text-sm font-semibold">Pickup details</h3>
            <Field name="pickupName" label="Pickup contact" defaultValue="QuickFynd Warehouse" />
            <Field name="pickupPhone" label="Pickup mobile" defaultValue="9876500001" />
            <Field name="pickupAddress" label="Pickup address" defaultValue="QuickFynd Warehouse, Kozhikode" className="md:col-span-2" />
            <Field name="pickupLat" label="Pickup latitude" defaultValue="11.2588" />
            <Field name="pickupLng" label="Pickup longitude" defaultValue="75.7804" />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <h3 className="md:col-span-2 text-sm font-semibold">Delivery details</h3>
            <Field name="name" label="Customer name" placeholder="Receiver full name" />
            <Field name="phone" label="Customer mobile" placeholder="10-digit mobile" />
            <Field name="address" label="Delivery address" placeholder="House / street / landmark" className="md:col-span-2" />
            <Field name="pincode" label="Pincode" placeholder="673001" />
            <Field name="dropLat" label="Drop latitude" defaultValue="11.2655" />
            <Field name="dropLng" label="Drop longitude" defaultValue="75.7900" />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <h3 className="md:col-span-2 text-sm font-semibold">Package</h3>
            <Field name="packageType" label="Package type" defaultValue="parcel" />
            <Field name="weight" label="Weight (kg)" defaultValue="1" />
            <Field name="count" label="Number of packages" defaultValue="1" />
            <label className="flex items-end gap-2 text-sm">
              <input type="checkbox" name="fragile" className="mb-3" />
              Fragile
            </label>
            <Field name="instructions" label="Special instructions" className="md:col-span-2" />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <h3 className="md:col-span-2 text-sm font-semibold">Payment & type</h3>
            <label className="block text-sm">
              <span className="font-medium">Payment</span>
              <select name="pay" className="mt-1.5 w-full rounded-xl border border-[var(--gc-line)] bg-[var(--gc-soft)] px-3.5 py-2.5">
                <option value="prepaid">Prepaid</option>
                <option value="cod">COD</option>
              </select>
            </label>
            <Field name="cod" label="COD amount" defaultValue="0" />
            <label className="block text-sm">
              <span className="font-medium">Delivery type</span>
              <select name="dtype" className="mt-1.5 w-full rounded-xl border border-[var(--gc-line)] bg-[var(--gc-soft)] px-3.5 py-2.5">
                <option value="standard">Standard</option>
                <option value="same_day">Same day</option>
                <option value="express">Express</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium">Vehicle</span>
              <select name="vehicle" className="mt-1.5 w-full rounded-xl border border-[var(--gc-line)] bg-[var(--gc-soft)] px-3.5 py-2.5">
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="car">Car</option>
                <option value="auto">Auto</option>
                <option value="van">Van</option>
              </select>
            </label>
            <Field name="ref" label="Order / reference" placeholder="ORDER123" className="md:col-span-2" />
          </section>

          {quote ? (
            <p className="rounded-2xl bg-[var(--gc-soft)] px-4 py-3 text-sm">
              Distance {quote.distanceKm} km · Charge {inr(quote.total)} · Rider {inr(quote.riderEarning)}
            </p>
          ) : null}
          {note ? (
            <p className="text-sm" role="status">
              {note}{" "}
              {awb ? (
                <Link href={`/track/${awb}`} className="font-semibold text-[var(--gc-accent)]">
                  Track {awb}
                </Link>
              ) : null}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand px-8 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create & dispatch"}
          </button>
        </form>
      </CustomerPanel>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  defaultValue,
  className = "",
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="font-medium">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-xl border border-[var(--gc-line)] bg-[var(--gc-soft)] px-3.5 py-2.5 outline-none focus:border-brand focus:bg-white"
      />
    </label>
  );
}

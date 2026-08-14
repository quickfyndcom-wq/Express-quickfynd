"use client";

import { useState } from "react";

export default function MerchantApiPage() {
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function runDemoFlow() {
    setBusy(true);
    setResult("Running flow…\n");
    try {
      const create = await fetch("/api/v1/deliveries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": "quickfynd",
        },
        body: JSON.stringify({
          companyId: "quickfynd",
          orderId: `QF-ORD-${Date.now().toString().slice(-5)}`,
          pickup: {
            name: "QuickFynd Warehouse",
            phone: "9876500001",
            address: "QuickFynd Warehouse, Kozhikode",
            lat: 11.2588,
            lng: 75.7804,
          },
          customer: {
            name: "Demo Customer",
            phone: "9900112233",
            address: "Mavoor Road, Kozhikode",
            pincode: "673004",
            lat: 11.2655,
            lng: 75.79,
          },
          package: { weightKg: 1 },
          payment: { type: "cod", amount: 499 },
        }),
      });
      const created = await create.json();
      let log = `1) Website → Courier API\nAWB: ${created.awb}\nTracking: ${created.trackingUrl}\n\n`;

      const awb = created.awb as string;
      const steps = [
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
      ];

      for (const status of steps) {
        const res = await fetch(`/api/v1/deliveries/${awb}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, riderId: "rdr_001" }),
        });
        const data = await res.json();
        log += `→ ${status}\n   webhook: ${data.webhook?.event}\n`;

        await fetch("/api/v1/webhooks/demo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.webhook),
        });
      }

      log += `\n2) Delivery status sent back to website (demo webhook OK)\n3) Track: /track/${awb}`;
      setResult(log);
    } catch (e) {
      setResult(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        API Integration
      </h2>
      <p className="text-sm text-muted">
        Ecommerce sites POST to /api/v1/deliveries (or /api/v1/shipments).
        The dispatch engine searches nearby riders and returns a tracking URL.
      </p>
      <pre className="overflow-x-auto border border-line bg-paper p-4 text-xs text-muted">
{`Customer logistics
GET  /api/v1/logistics/services
POST /api/v1/logistics/quote
POST /api/v1/logistics/nearby
POST /api/v1/logistics/book
POST /api/v1/logistics/request-rider
GET  /api/v1/logistics/book?phone=
POST /api/v1/logistics/rate
GET  /api/v1/track/{awb}

Company / ecommerce
POST /api/v1/deliveries
POST /api/v1/deliveries/{awb}/dispatch
POST /api/v1/deliveries/{awb}/accept
POST /api/v1/deliveries/{awb}/status`}
      </pre>
      <button
        type="button"
        disabled={busy}
        onClick={runDemoFlow}
        className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Running…" : "Run full order → delivery demo"}
      </button>
      {result ? (
        <pre className="overflow-x-auto whitespace-pre-wrap border border-line bg-mist p-4 text-xs text-ink">
          {result}
        </pre>
      ) : null}
    </div>
  );
}

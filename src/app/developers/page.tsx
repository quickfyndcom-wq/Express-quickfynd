import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";

const BASE = "https://express-quickfynd-iawj.vercel.app";

const GROUPS: { title: string; rows: { method: string; path: string; note: string }[] }[] = [
  {
    title: "Health",
    rows: [
      { method: "GET", path: "/api/v1/health", note: "API health" },
      { method: "GET", path: "/api/v1/supabase/health", note: "Database ping" },
    ],
  },
  {
    title: "Customer logistics",
    rows: [
      { method: "GET", path: "/api/v1/logistics/services", note: "Services, goods, places" },
      { method: "POST", path: "/api/v1/logistics/quote", note: "Fare + recommended vehicle" },
      { method: "GET/POST", path: "/api/v1/logistics/nearby", note: "Nearby partners (no phone)" },
      { method: "POST", path: "/api/v1/logistics/book", note: "Confirm public booking" },
      { method: "GET", path: "/api/v1/logistics/book", note: "Activity by mobile" },
      { method: "POST", path: "/api/v1/logistics/request-rider", note: "Find / choose partner" },
      { method: "POST", path: "/api/v1/logistics/rate", note: "Rating + tip" },
      { method: "GET/POST", path: "/api/v1/logistics/places", note: "Saved addresses" },
      { method: "POST", path: "/api/v1/public/book", note: "Legacy public book" },
      { method: "POST", path: "/api/v1/quote", note: "Simple fare" },
      { method: "GET", path: "/api/v1/track/{awb}", note: "Public live tracking" },
    ],
  },
  {
    title: "Company deliveries",
    rows: [
      { method: "GET", path: "/api/v1/deliveries", note: "List jobs" },
      { method: "POST", path: "/api/v1/deliveries", note: "Create job" },
      { method: "GET", path: "/api/v1/deliveries/{id}", note: "Get by id or AWB" },
      { method: "DELETE", path: "/api/v1/deliveries/{id}", note: "Delete job" },
      { method: "POST", path: "/api/v1/deliveries/{id}/dispatch", note: "Offer next rider" },
      { method: "POST", path: "/api/v1/deliveries/{id}/accept", note: "Accept / decline" },
      { method: "POST", path: "/api/v1/deliveries/{id}/status", note: "Advance status" },
      { method: "POST", path: "/api/v1/deliveries/{id}/otp", note: "Pickup / delivery OTP" },
      { method: "GET/POST", path: "/api/v1/shipments", note: "Ecommerce alias" },
      { method: "GET", path: "/api/v1/shipments/{awb}", note: "Get shipment" },
      { method: "POST", path: "/api/v1/shipments/{awb}/status", note: "Update shipment" },
    ],
  },
  {
    title: "Ops, riders, GPS",
    rows: [
      { method: "GET", path: "/api/v1/ops/live", note: "Live operations board" },
      { method: "GET", path: "/api/v1/stats", note: "Dashboard stats" },
      { method: "GET/POST/DELETE", path: "/api/v1/riders", note: "Partners / online flag" },
      { method: "POST", path: "/api/v1/riders/gps", note: "GPS ping" },
      { method: "GET/DELETE", path: "/api/v1/zones", note: "Service zones" },
      { method: "GET", path: "/api/v1/sellers", note: "Sellers" },
      { method: "GET", path: "/api/v1/pricing", note: "Rate rules" },
      { method: "GET", path: "/api/admin/ops", note: "Admin ops snapshot" },
    ],
  },
  {
    title: "Companies",
    rows: [
      { method: "GET/POST", path: "/api/v1/orgs", note: "List / create" },
      { method: "GET/PATCH/DELETE", path: "/api/v1/orgs/{id}", note: "Get / approve / delete" },
      { method: "GET", path: "/api/v1/organizations", note: "Alias list" },
    ],
  },
  {
    title: "Rider app",
    rows: [
      { method: "POST", path: "/api/rider/auth/login", note: "Demo: rider@quickfynd.com / rider123" },
      { method: "GET", path: "/api/rider/me", note: "Profile (Bearer token)" },
      { method: "POST", path: "/api/rider/attendance/check-in", note: "Duty on" },
      { method: "POST", path: "/api/rider/attendance/check-out", note: "Duty off" },
      { method: "GET", path: "/api/rider/pickups", note: "Pickup tasks" },
      { method: "GET", path: "/api/rider/deliveries", note: "Delivery tasks" },
      { method: "POST", path: "/api/rider/scan", note: "Scan AWB" },
      { method: "GET/POST", path: "/api/rider/gps", note: "Location" },
      { method: "POST", path: "/api/rider/otp/send", note: "Send OTP" },
      { method: "POST", path: "/api/rider/otp/verify", note: "Verify OTP" },
      { method: "POST", path: "/api/rider/pod", note: "Proof of delivery" },
      { method: "POST", path: "/api/rider/cod/collect", note: "Collect COD" },
      { method: "POST", path: "/api/rider/delivery/failed", note: "Failed attempt" },
      { method: "GET/POST", path: "/api/rider/settlement", note: "Earnings" },
      { method: "GET", path: "/api/rider/tasks/{id}/navigation", note: "Nav points" },
      { method: "GET", path: "/api/rider/tasks/{id}/customer", note: "Masked customer" },
    ],
  },
  {
    title: "Other",
    rows: [
      { method: "DELETE", path: "/api/v1/records", note: "?type=&id=" },
      { method: "GET/POST", path: "/api/v1/webhooks/demo", note: "Demo webhook" },
    ],
  },
];

export default function DevelopersPage() {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <BrandLogo variant="dark" size="sm" />
          <Link href="/logistics" className="text-sm font-semibold text-brand">
            Book a delivery
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Share this page
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold">
          QuickFynd Express API
        </h1>
        <p className="mt-3 text-sm text-muted">
          Live base:{" "}
          <a href={BASE} className="font-semibold text-brand">
            {BASE}
          </a>
          . Full write-up:{" "}
          <a
            href="https://github.com/quickfyndcom-wq/Express-quickfynd/blob/main/docs/API.md"
            className="font-semibold text-brand"
          >
            docs/API.md
          </a>
        </p>

        <pre className="mt-6 overflow-x-auto rounded-2xl bg-ink p-4 text-xs text-white">
{`curl ${BASE}/api/v1/health

curl -X POST ${BASE}/api/v1/logistics/nearby \\
  -H "Content-Type: application/json" \\
  -d '{"lat":11.2588,"lng":75.7804,"vehicle":"bike"}'`}
        </pre>

        {GROUPS.map((g) => (
          <section key={g.title} className="mt-10">
            <h2 className="text-lg font-bold">{g.title}</h2>
            <div className="mt-3 overflow-hidden rounded-2xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="bg-mist text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2">Method</th>
                    <th className="px-3 py-2">Path</th>
                    <th className="px-3 py-2">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {g.rows.map((r) => (
                    <tr key={r.path} className="border-t border-line">
                      <td className="px-3 py-2 font-mono text-xs font-semibold">{r.method}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.path}</td>
                      <td className="px-3 py-2 text-muted">{r.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        <p className="mt-10 text-sm text-muted">
          Book in the browser at{" "}
          <Link href="/logistics" className="font-semibold text-brand">
            /logistics
          </Link>
          . Track at <code className="text-ink">/track/{"{AWB}"}</code>.
        </p>
      </main>
      <Footer />
    </div>
  );
}

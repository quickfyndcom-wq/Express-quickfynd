import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Footer } from "@/components/Footer";

const BASE = "https://express-quickfynd-iawj.vercel.app";

const GROUPS: { title: string; rows: { method: string; path: string; note: string }[] }[] = [
  {
    title: "Customer logistics",
    rows: [
      { method: "GET", path: "/api/v1/logistics/services", note: "Services, goods, places" },
      { method: "POST", path: "/api/v1/logistics/quote", note: "Fare + recommended vehicle" },
      { method: "POST", path: "/api/v1/logistics/nearby", note: "Nearby partners (no phone)" },
      { method: "POST", path: "/api/v1/logistics/book", note: "Confirm public booking" },
      { method: "GET", path: "/api/v1/logistics/book?phone=", note: "Activity by mobile" },
      { method: "POST", path: "/api/v1/logistics/request-rider", note: "Quick assign / choose partner" },
      { method: "POST", path: "/api/v1/logistics/rate", note: "Rating + tip" },
      { method: "GET", path: "/api/v1/track/{awb}", note: "Public live tracking JSON" },
    ],
  },
  {
    title: "Company / ecommerce",
    rows: [
      { method: "POST", path: "/api/v1/deliveries", note: "Create job (header x-org-slug)" },
      { method: "GET", path: "/api/v1/deliveries", note: "List jobs" },
      { method: "POST", path: "/api/v1/deliveries/{awb}/dispatch", note: "Offer next rider" },
      { method: "POST", path: "/api/v1/deliveries/{awb}/accept", note: "Rider accept / decline" },
      { method: "POST", path: "/api/v1/deliveries/{awb}/otp", note: "Pickup or delivery OTP" },
      { method: "POST", path: "/api/v1/deliveries/{awb}/status", note: "Advance status" },
    ],
  },
  {
    title: "Ops & riders",
    rows: [
      { method: "GET", path: "/api/v1/health", note: "API health" },
      { method: "GET", path: "/api/v1/ops/live", note: "Live map board" },
      { method: "GET", path: "/api/v1/riders", note: "Delivery partners" },
      { method: "POST", path: "/api/v1/riders/gps", note: "Live GPS ping" },
      { method: "POST", path: "/api/rider/auth/login", note: "Rider app login" },
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

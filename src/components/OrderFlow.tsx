const steps = [
  {
    title: "Customer places order",
    detail: "Shopper checks out on QuickFynd, Nilaas, or any connected website.",
  },
  {
    title: "Website confirms the order",
    detail: "Payment / COD and address are validated on the merchant site.",
  },
  {
    title: "Website sends order to Courier API",
    detail: "POST /api/v1/shipments with org API key and order payload.",
  },
  {
    title: "QuickFynd Express creates shipment",
    detail: "Courier platform registers the parcel under that organization.",
  },
  {
    title: "Tracking number generated",
    detail: "Unique AWB is created and stored against the order reference.",
  },
  {
    title: "Tracking number returned to website",
    detail: "API response includes awb + tracking URL for the customer.",
  },
  {
    title: "Pickup request created",
    detail: "Hub / rider queue gets an awaiting_pickup task.",
  },
  {
    title: "Courier rider assigned",
    detail: "Dispatch assigns a rider; live GPS can begin on check-in.",
  },
  {
    title: "Parcel picked up",
    detail: "Scan at pickup → status picked_up → webhook to website.",
  },
  {
    title: "Live tracking starts",
    detail: "Customer and merchant follow /track/[awb] and status events.",
  },
  {
    title: "Parcel delivered",
    detail: "OTP / POD / COD collected; status becomes delivered.",
  },
  {
    title: "Delivery status sent back to website",
    detail: "Signed webhook: shipment.status_updated → merchant order complete.",
  },
];

export function OrderFlow() {
  return (
    <section id="order-flow" className="bg-paper px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Integration flow
        </p>
        <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-ink md:text-5xl">
          From website order to doorstep
        </h2>
        <p className="mt-4 max-w-2xl text-muted leading-relaxed">
          How QuickFynd Express connects any eCommerce site — QuickFynd,
          Nilaas, or partners — through the Courier API and webhooks.
        </p>

        <ol className="mt-12 space-y-0 border-l border-line pl-6 md:pl-8">
          {steps.map((step, index) => (
            <li key={step.title} className="relative pb-8 last:pb-0">
              <span className="absolute -left-[1.9rem] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white md:-left-[2.15rem]">
                {index + 1}
              </span>
              <h3 className="font-[family-name:var(--font-syne)] text-lg font-bold text-ink">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="/api/v1/health"
            className="rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink-soft"
          >
            Courier API
          </a>
          <a
            href="/dashboard/api"
            className="rounded-md border border-ink/20 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink/40"
          >
            Merchant API docs
          </a>
          <a
            href="/track/QF2000002001"
            className="rounded-md px-6 py-3 text-sm font-semibold text-muted transition hover:text-ink"
          >
            Sample tracking →
          </a>
        </div>
      </div>
    </section>
  );
}

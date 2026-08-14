const points = [
  {
    title: "Real-time tracking",
    body: "Follow every AWB from pickup to POD with clear status updates.",
  },
  {
    title: "On-time intent",
    body: "Hub sort and lane partners focused on the published transit window.",
  },
  {
    title: "COD you can settle",
    body: "Cash collection on serviceable pincodes with GST-ready invoicing.",
  },
  {
    title: "Ops desk that answers",
    body: "Mon–Sat support for booking, exceptions, and invoice help.",
  },
];

export function WhyChoose() {
  return (
    <section className="bg-[#f4f5f7] px-5 py-20 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand">
          Why QuickFynd Express
        </p>
        <h2 className="mt-2 max-w-xl font-[family-name:var(--font-syne)] text-3xl font-bold text-ink md:text-4xl">
          Built for merchants who need the parcel to arrive
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <div key={p.title}>
              <span className="font-[family-name:var(--font-syne)] text-3xl font-bold text-brand/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-bold text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

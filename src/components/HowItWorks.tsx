const points = [
  {
    title: "Real-time tracking",
    detail: "Follow every AWB from pickup to proof of delivery.",
  },
  {
    title: "On-time focus",
    detail: "Clear lane windows for Kerala, South India, and pan-India.",
  },
  {
    title: "COD settlement",
    detail: "Cash collection reconciled under NILAAS GST invoicing.",
  },
  {
    title: "Merchant desk",
    detail: "Login for bookings and shipment history after approval.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#1a1a1a] px-5 py-16 text-white md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Why us
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold md:text-4xl">
            Why choose QuickFynd Express
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 bg-brand" />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p, i) => (
            <div
              key={p.title}
              className="border border-white/10 bg-white/5 p-6 transition hover:border-brand/50"
            >
              <span className="font-[family-name:var(--font-syne)] text-3xl font-bold text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-syne)] text-lg font-bold">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{p.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

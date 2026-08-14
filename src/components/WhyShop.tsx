const reasons = [
  {
    title: "Clear & affordable pricing",
    body: "No fake MRP games or confusing discounts. Just simple, visible pricing.",
  },
  {
    title: "Fast & tracked delivery",
    body: "Partnered couriers with tracking updates till your doorstep.",
  },
  {
    title: "Basic quality checks",
    body: "Products are inspected before dispatch to avoid avoidable issues.",
  },
  {
    title: "Customer-first support",
    body: "Simple communication, clear updates and genuine attempt to resolve problems.",
  },
];

export function WhyShop() {
  return (
    <section id="why" className="bg-mist px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Why shop with QuickFynd?
        </p>
        <h2 className="mt-3 max-w-xl font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-ink md:text-5xl">
          Shopping without the tricks.
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {reasons.map((item) => (
            <div key={item.title} className="border-l-2 border-brand pl-5">
              <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

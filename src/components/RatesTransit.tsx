import Link from "next/link";

const rows = [
  { lane: "Within Kerala", transit: "1–3 working days" },
  { lane: "South India", transit: "3–5 working days" },
  { lane: "Pan-India", transit: "3–7 working days" },
  { lane: "COD", transit: "Same transit + cash collection" },
];

export function RatesTransit() {
  return (
    <section id="rates" className="bg-neutral-950 px-5 py-16 text-white md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold md:text-4xl">
              Transit you can plan around
            </h2>
            <p className="mt-3 max-w-lg text-neutral-400">
              Indicative windows. Exact rates depend on weight, zone, and COD —
              ask for a merchant rate card.
            </p>
          </div>
          <Link
            href="#contact"
            className="inline-flex bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
          >
            Request rates
          </Link>
        </div>

        <div className="mt-10 overflow-hidden border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-5 py-3 font-semibold">Lane</th>
                <th className="px-5 py-3 font-semibold">Transit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.lane} className="border-t border-white/10">
                  <td className="px-5 py-4 font-medium">{r.lane}</td>
                  <td className="px-5 py-4 text-neutral-300">{r.transit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

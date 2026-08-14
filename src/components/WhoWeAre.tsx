import Image from "next/image";

const pillars = [
  {
    title: "Sustainable logistics",
    body: "Smarter routes and careful handling to cut wasted trips, damage, and reattempts — cleaner delivery for every order.",
    image: "/svc-express.jpg",
  },
  {
    title: "Flexible solutions",
    body: "Documents, e-commerce parcels, COD, and returns — scaled to shops and warehouses across Kerala and India.",
    image: "/svc-ecommerce.jpg",
  },
  {
    title: "Supply chain resilience",
    body: "Hub ops, partner linehaul, and live AWB tracking keep consignments moving when demand rises.",
    image: "/svc-cargo.jpg",
  },
];

export function WhoWeAre() {
  return (
    <section id="solutions" className="bg-[#eef2f6] px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-[family-name:var(--font-syne)] text-3xl font-bold text-neutral-900 md:text-4xl">
          Delivery unlimited
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-neutral-600">
          Built for merchants who need reliable last mile, clear transit, and a
          support desk that responds. Powered by Nilaas.
        </p>

        <div className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {pillars.map((p) => (
            <article key={p.title} className="flex flex-col items-center text-center">
              <div className="relative h-40 w-40 overflow-hidden rounded-full shadow-lg ring-4 ring-white">
                <Image src={p.image} alt="" fill className="object-cover" sizes="160px" />
              </div>
              <h3 className="mt-6 font-[family-name:var(--font-syne)] text-lg font-bold text-neutral-900">
                {p.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

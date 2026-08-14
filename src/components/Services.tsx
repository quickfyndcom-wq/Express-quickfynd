import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "Express",
    body: "Fast, tracked delivery for documents and parcels — from Kerala hubs to destinations across India.",
    image: "/svc-express.jpg",
  },
  {
    title: "E-commerce",
    body: "Pickup, sort, last mile, OTP / POD, and reattempts so online orders reach customers reliably.",
    image: "/svc-ecommerce.jpg",
  },
  {
    title: "Logistics",
    body: "COD settlement under NILAAS GST, RTO workflows, and freight support for heavier consignments.",
    image: "/svc-cargo.jpg",
  },
];

export function Services() {
  return (
    <section id="services" className="bg-white px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-syne)] text-3xl font-bold text-neutral-950 md:text-4xl">
            Express. E-commerce. Logistics.
          </h2>
          <p className="mt-3 text-neutral-600">
            End-to-end courier services designed for everyday commerce.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {services.map((s) => (
            <article key={s.title} className="group flex flex-col overflow-hidden bg-neutral-50">
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width:1024px) 100vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-[family-name:var(--font-syne)] text-xl font-bold text-neutral-950">
                  {s.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-600">
                  {s.body}
                </p>
                <Link
                  href="#contact"
                  className="mt-5 text-sm font-semibold text-brand hover:underline"
                >
                  Learn more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

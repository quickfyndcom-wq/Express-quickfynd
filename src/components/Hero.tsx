import Image from "next/image";
import Link from "next/link";
import { TrackAwbForm } from "@/components/TrackAwbForm";

const quickLinks = [
  { title: "Rate calculator", desc: "Transit windows by lane", href: "#rates" },
  { title: "Send shipment", desc: "Book a pickup today", href: "/logistics" },
  { title: "Business desk", desc: "Merchant onboarding", href: "/register" },
  { title: "Help centre", desc: "FAQs and support", href: "#support" },
];

export function Hero() {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 pt-10 md:grid-cols-2 md:gap-12 md:px-8 md:pt-14">
        <div className="order-2 md:order-1 md:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Delivery unlimited
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-syne)] text-4xl font-bold leading-[1.1] text-neutral-950 sm:text-5xl">
            Your parcels,
            <br />
            delivered with care
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-600">
            Express courier and e-commerce last mile across Kerala and India.
            Track every shipment. Settle COD with clarity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#track"
              className="bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep"
            >
              Track shipment
            </a>
            <Link
              href="/login"
              className="border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 hover:border-brand hover:text-brand"
            >
              Merchant login
            </Link>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-lg overflow-hidden rounded-[2rem] bg-black md:max-w-none">
            <Image
              src="/hero-main.png"
              alt="QuickFynd Express courier delivering a branded parcel"
              fill
              priority
              unoptimized
              className="object-cover object-center"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      <div id="track" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-14 pt-8 md:px-8">
        <div className="border border-neutral-200 bg-white p-6 md:p-8">
          <div className="mb-5 flex flex-col gap-2 border-b border-neutral-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-neutral-950">
                Track your shipment
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Enter AWB number for live status updates
              </p>
            </div>
            <Link href="/track" className="text-sm font-semibold text-brand hover:underline">
              Advanced tracking
            </Link>
          </div>
          <TrackAwbForm variant="panel" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:bg-neutral-50"
            >
              <p className="text-sm font-bold text-neutral-900">{item.title}</p>
              <p className="mt-1 text-xs text-neutral-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

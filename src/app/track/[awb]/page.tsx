import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { TrackAwbForm } from "@/components/TrackAwbForm";
import { Footer } from "@/components/Footer";
import { LiveTrackView } from "@/components/delivery/LiveTrackView";

type PageProps = {
  params: Promise<{ awb: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { awb } = await params;
  return {
    title: `Track ${decodeURIComponent(awb)} · QuickFynd Delivery`,
    description: `Live shipment tracking for ${decodeURIComponent(awb)}`,
  };
}

export default async function TrackPage({ params }: PageProps) {
  const { awb: raw } = await params;
  const awb = decodeURIComponent(raw).toUpperCase();

  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="border-b border-line bg-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <BrandLogo variant="light" size="sm" />
          <Link href="/logistics" className="text-sm font-medium text-white/70 transition hover:text-white">
            Book a courier
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 md:px-8 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Live tracking
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Order #{awb}
        </h1>
        <p className="mt-2 text-muted">
          No app required — this page updates as the rider moves.
        </p>

        <div className="mt-10">
          <LiveTrackView awb={awb} />
        </div>

        <div className="mt-12 max-w-sm">
          <h3 className="font-[family-name:var(--font-syne)] text-sm font-bold uppercase tracking-wider">
            Track another
          </h3>
          <div className="mt-4">
            <TrackAwbForm variant="page" initialAwb="" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

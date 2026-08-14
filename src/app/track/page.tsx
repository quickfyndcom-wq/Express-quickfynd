import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { TrackAwbForm } from "@/components/TrackAwbForm";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Track shipment · QuickFynd Express",
  description: "Enter your AWB number to track a QuickFynd Express shipment.",
};

export default function TrackIndexPage() {
  return (
    <div className="flex min-h-full flex-col bg-paper">
      <header className="border-b border-line bg-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <BrandLogo variant="light" size="sm" />
          <Link
            href="/"
            className="text-sm font-medium text-white/70 transition hover:text-white"
          >
            Home
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 md:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
          Tracking
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-syne)] text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Track your AWB
        </h1>
        <p className="mt-3 text-muted">
          Enter your tracking number to see live rider position and ETA. Try{" "}
          <Link href="/track/QFD12345601" className="font-semibold text-brand">
            QFD12345601
          </Link>
          .
        </p>
        <div className="mt-8">
          <TrackAwbForm variant="page" />
        </div>
      </main>

      <Footer />
    </div>
  );
}

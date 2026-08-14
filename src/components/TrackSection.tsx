import { TrackAwbForm } from "@/components/TrackAwbForm";

export function TrackSection() {
  return (
    <section id="track" className="border-b border-line bg-paper px-5 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold tracking-tight text-ink md:text-3xl">
          Track your shipment
        </h2>
        <p className="mt-2 max-w-lg text-muted">
          Enter the AWB or order number from your invoice or SMS.
        </p>
        <div className="mt-8">
          <TrackAwbForm variant="page" />
        </div>
      </div>
    </section>
  );
}

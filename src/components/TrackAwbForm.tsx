"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type TrackAwbFormProps = {
  variant?: "hero" | "page" | "panel";
  initialAwb?: string;
};

export function TrackAwbForm({
  variant = "page",
  initialAwb = "",
}: TrackAwbFormProps) {
  const router = useRouter();
  const [awb, setAwb] = useState(initialAwb);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const cleaned = awb.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleaned) {
      setError("Enter your tracking / AWB number.");
      return;
    }
    if (cleaned.length < 6) {
      setError("Number looks too short.");
      return;
    }
    setError("");
    router.push(`/track/${encodeURIComponent(cleaned)}?type=awb`);
  }

  const isHero = variant === "hero";
  const isPanel = variant === "panel";

  return (
    <form
      onSubmit={onSubmit}
      className={isPanel || isHero ? "w-full" : "w-full max-w-xl"}
      noValidate
    >
      <div
        className={
          isHero
            ? "flex flex-col gap-2 border border-white/25 bg-black/35 p-2 sm:flex-row"
            : "flex flex-col gap-3 sm:flex-row sm:items-stretch"
        }
      >
        <input
          id="awb"
          name="awb"
          type="text"
          value={awb}
          onChange={(e) => {
            setAwb(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter tracking / AWB number"
          autoComplete="off"
          spellCheck={false}
          className={
            isHero
              ? "min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/45"
              : "min-w-0 flex-1 border border-[#d1d5db] bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-[#9ca3af] focus:border-brand"
          }
        />
        <button
          type="submit"
          className="shrink-0 bg-brand px-7 py-3 text-sm font-semibold text-white transition hover:bg-brand-deep"
        >
          Track
        </button>
      </div>
      {error ? (
        <p className={`mt-2 text-sm ${isHero ? "text-red-200" : "text-brand"}`} role="alert">
          {error}
        </p>
      ) : !isPanel ? (
        <p className={`mt-2 text-xs ${isHero ? "text-white/45" : "text-muted"}`}>
          Example: QF1234567890
        </p>
      ) : null}
    </form>
  );
}

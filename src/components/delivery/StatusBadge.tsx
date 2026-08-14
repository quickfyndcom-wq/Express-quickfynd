import type { DeliveryStatus } from "@/lib/delivery";

const TONES: Record<string, string> = {
  delivered: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  cancelled: "bg-slate-100 text-slate-600",
  returned: "bg-orange-50 text-orange-700",
  searching_rider: "bg-amber-50 text-amber-800",
  ready_for_pickup: "bg-sky-50 text-sky-800",
  out_for_delivery: "bg-teal-50 text-teal-800",
  rider_arriving: "bg-teal-50 text-teal-800",
  picked_up: "bg-indigo-50 text-indigo-700",
  going_to_pickup: "bg-violet-50 text-violet-700",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = TONES[status] ?? "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function companyQuery(org?: { id?: string; slug?: string } | null) {
  return org?.slug || org?.id || "";
}

export const ACTIVE_STATUSES: DeliveryStatus[] = [
  "ready_for_pickup",
  "searching_rider",
  "rider_assigned",
  "going_to_pickup",
  "arrived_pickup",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "rider_arriving",
  "arrived",
];

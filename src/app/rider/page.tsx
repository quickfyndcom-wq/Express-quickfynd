import { StatGrid } from "@/components/PortalShell";
import { db } from "@/lib/rider-store";

export default function RiderHome() {
  const rider = db.riders[0];
  return (
    <div className="space-y-6">
      <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
        Duty / Attendance
      </h2>
      <p className="text-sm text-muted">
        {rider
          ? `${rider.name} · ${rider.hubId} · ${rider.vehicle}`
          : "No riders in the database yet. Super Admin will add riders."}
      </p>
      <StatGrid
        items={[
          {
            label: "Open pickups",
            value: db.pickups.filter((p) => p.status !== "completed").length,
          },
          {
            label: "Open deliveries",
            value: db.deliveries.filter(
              (d) => d.status !== "completed" && d.status !== "failed",
            ).length,
          },
        ]}
      />
    </div>
  );
}

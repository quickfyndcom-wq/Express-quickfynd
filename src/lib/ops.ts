import { db, publicRider } from "@/lib/rider-store";

export function getOpsData() {
  const latestGpsByRider = new Map<string, (typeof db.gpsPings)[0]>();
  for (const ping of db.gpsPings) {
    latestGpsByRider.set(ping.riderId, ping);
  }

  return {
    ok: true as const,
    summary: {
      riders: db.riders.length,
      online: latestGpsByRider.size,
      pickupsOpen: db.pickups.filter((p) => p.status !== "completed").length,
      deliveriesOpen: db.deliveries.filter(
        (d) => d.status !== "completed" && d.status !== "failed",
      ).length,
      codToday: db.codCollections
        .filter((c) => c.at.startsWith(db.today()))
        .reduce((s, c) => s + c.amount, 0),
      failuresToday: db.failures.filter((f) => f.at.startsWith(db.today())).length,
    },
    riders: db.riders.map(publicRider),
    attendance: db.attendance,
    pickups: db.pickups,
    deliveries: db.deliveries,
    gps: [...latestGpsByRider.values()],
    scans: db.scans,
    pods: db.pods,
    cod: db.codCollections,
    failures: db.failures,
    settlements: db.settlements,
  };
}

export async function getOps() {
  return getOpsData();
}

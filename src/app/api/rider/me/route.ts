import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth, publicRider } from "@/lib/rider-store";

export async function GET(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const att = db.attendance.find(
    (a) => a.riderId === rider.id && a.date === db.today(),
  );
  const gps = [...db.gpsPings].reverse().find((g) => g.riderId === rider.id);

  return NextResponse.json({
    ok: true,
    rider: publicRider(rider),
    attendance: att ?? { riderId: rider.id, date: db.today(), checkInAt: null, checkOutAt: null },
    lastGps: gps ?? null,
    counts: {
      pickups: db.pickups.filter((p) => p.riderId === rider.id && p.status !== "completed").length,
      deliveries: db.deliveries.filter((d) => d.riderId === rider.id && d.status !== "completed" && d.status !== "failed").length,
    },
  });
}

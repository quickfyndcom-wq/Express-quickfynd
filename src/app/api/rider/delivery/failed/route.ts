import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const taskId = String(body.taskId ?? "");
  const reason = String(body.reason ?? "").trim();
  const notes = String(body.notes ?? "");

  const delivery = db.deliveries.find((d) => d.id === taskId && d.riderId === rider.id);
  if (!delivery) {
    return NextResponse.json({ ok: false, error: "Delivery not found" }, { status: 404 });
  }
  if (!reason) {
    return NextResponse.json({ ok: false, error: "Reason required" }, { status: 400 });
  }

  const report = {
    id: db.id("fail"),
    riderId: rider.id,
    taskId,
    awb: delivery.awb,
    reason,
    notes,
    at: new Date().toISOString(),
  };
  db.failures.push(report);
  delivery.status = "failed";

  const stl = db.settlements.find(
    (s) => s.riderId === rider.id && s.date === db.today(),
  );
  if (stl) stl.totalFailed += 1;

  return NextResponse.json({ ok: true, report, delivery });
}

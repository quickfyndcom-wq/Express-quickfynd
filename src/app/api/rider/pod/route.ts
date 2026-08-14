import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const taskId = String(body.taskId ?? "");
  const delivery = db.deliveries.find((d) => d.id === taskId && d.riderId === rider.id);
  if (!delivery) {
    return NextResponse.json({ ok: false, error: "Delivery not found" }, { status: 404 });
  }

  const record = {
    id: db.id("pod"),
    riderId: rider.id,
    taskId,
    awb: delivery.awb,
    photoUrl: body.photoUrl ? String(body.photoUrl) : undefined,
    signatureUrl: body.signatureUrl ? String(body.signatureUrl) : undefined,
    otpVerified: Boolean(body.otpVerified),
    at: new Date().toISOString(),
  };
  db.pods.push(record);
  delivery.status = "completed";

  const stl = db.settlements.find(
    (s) => s.riderId === rider.id && s.date === db.today(),
  );
  if (stl) stl.totalDelivered += 1;

  return NextResponse.json({ ok: true, pod: record, delivery });
}

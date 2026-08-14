import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const awb = String(body.awb ?? "").trim().toUpperCase();
  if (!awb) {
    return NextResponse.json({ ok: false, error: "AWB required" }, { status: 400 });
  }

  const pickup = db.pickups.find((p) => p.awb === awb && p.riderId === rider.id);
  const delivery = db.deliveries.find((d) => d.awb === awb && d.riderId === rider.id);
  const task = pickup ?? delivery;
  if (!task) {
    return NextResponse.json({ ok: false, error: "AWB not assigned to you" }, { status: 404 });
  }

  const type = pickup ? "pickup" : "delivery";
  const event = {
    id: db.id("scn"),
    riderId: rider.id,
    awb,
    taskId: task.id,
    type: type as "pickup" | "delivery",
    at: new Date().toISOString(),
  };
  db.scans.push(event);

  if (task.status === "assigned") task.status = "en_route";

  return NextResponse.json({ ok: true, scan: event, task });
}

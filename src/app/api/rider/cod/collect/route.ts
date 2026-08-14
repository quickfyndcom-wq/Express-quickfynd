import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const taskId = String(body.taskId ?? "");
  const amount = Number(body.amount);
  const method = body.method === "upi" ? "upi" : "cash";

  const delivery = db.deliveries.find((d) => d.id === taskId && d.riderId === rider.id);
  if (!delivery) {
    return NextResponse.json({ ok: false, error: "Delivery not found" }, { status: 404 });
  }
  if (delivery.codAmount <= 0) {
    return NextResponse.json({ ok: false, error: "No COD on this shipment" }, { status: 400 });
  }
  if (Number.isNaN(amount) || amount !== delivery.codAmount) {
    return NextResponse.json(
      { ok: false, error: `Expected COD ₹${delivery.codAmount}` },
      { status: 400 },
    );
  }

  const collection = {
    id: db.id("cod"),
    riderId: rider.id,
    taskId,
    awb: delivery.awb,
    amount,
    method: method as "cash" | "upi",
    at: new Date().toISOString(),
  };
  db.codCollections.push(collection);

  const stl = db.settlements.find(
    (s) => s.riderId === rider.id && s.date === db.today(),
  );
  if (stl) stl.totalCod += amount;

  return NextResponse.json({ ok: true, collection });
}

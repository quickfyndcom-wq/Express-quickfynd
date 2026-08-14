import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function GET(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let stl = db.settlements.find(
    (s) => s.riderId === rider.id && s.date === db.today(),
  );
  if (!stl) {
    stl = {
      id: db.id("stl"),
      riderId: rider.id,
      date: db.today(),
      totalCod: 0,
      totalDelivered: 0,
      totalFailed: 0,
      cashHanded: 0,
      status: "open",
      submittedAt: null,
    };
    db.settlements.push(stl);
  }

  const cashCollected = db.codCollections
    .filter((c) => c.riderId === rider.id && c.method === "cash" && c.at.startsWith(db.today()))
    .reduce((sum, c) => sum + c.amount, 0);

  return NextResponse.json({
    ok: true,
    settlement: { ...stl, cashCollected },
    collections: db.codCollections.filter((c) => c.riderId === rider.id && c.at.startsWith(db.today())),
  });
}

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const cashHanded = Number(body.cashHanded ?? 0);

  let stl = db.settlements.find(
    (s) => s.riderId === rider.id && s.date === db.today(),
  );
  if (!stl) {
    return NextResponse.json({ ok: false, error: "No settlement for today" }, { status: 404 });
  }

  stl.cashHanded = cashHanded;
  stl.status = "submitted";
  stl.submittedAt = new Date().toISOString();

  return NextResponse.json({ ok: true, settlement: stl });
}

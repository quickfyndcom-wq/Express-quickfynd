import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const att = db.attendance.find(
    (a) => a.riderId === rider.id && a.date === db.today(),
  );
  if (!att?.checkInAt) {
    return NextResponse.json(
      { ok: false, error: "Check in first" },
      { status: 400 },
    );
  }
  att.checkOutAt = new Date().toISOString();
  return NextResponse.json({ ok: true, attendance: att });
}

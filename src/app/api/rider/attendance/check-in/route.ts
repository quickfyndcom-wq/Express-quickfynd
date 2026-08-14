import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let att = db.attendance.find(
    (a) => a.riderId === rider.id && a.date === db.today(),
  );
  if (!att) {
    att = {
      riderId: rider.id,
      date: db.today(),
      checkInAt: null,
      checkOutAt: null,
    };
    db.attendance.push(att);
  }
  if (att.checkInAt) {
    return NextResponse.json({ ok: true, attendance: att, message: "Already checked in" });
  }
  att.checkInAt = new Date().toISOString();
  return NextResponse.json({ ok: true, attendance: att });
}

import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function GET(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const items = db.pickups.filter((p) => p.riderId === rider.id);
  return NextResponse.json({ ok: true, pickups: items });
}

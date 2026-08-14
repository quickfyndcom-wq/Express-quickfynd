import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  const accuracy = Number(body.accuracy ?? 0);

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ ok: false, error: "lat/lng required" }, { status: 400 });
  }

  const ping = {
    riderId: rider.id,
    lat,
    lng,
    accuracy,
    at: new Date().toISOString(),
  };
  db.gpsPings.push(ping);

  return NextResponse.json({ ok: true, gps: ping });
}

export async function GET(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  // Admin dashboard may call without rider auth via /api/admin — rider GPS list for self:
  if (rider) {
    const mine = db.gpsPings.filter((g) => g.riderId === rider.id).slice(-20);
    return NextResponse.json({ ok: true, pings: mine });
  }
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

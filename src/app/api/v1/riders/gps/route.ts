import { NextRequest, NextResponse } from "next/server";
import { deliveryDb, publicRider } from "@/lib/delivery";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const riderId = String(body.riderId ?? body.rider_id ?? "");
  const lat = Number(body.latitude ?? body.lat);
  const lng = Number(body.longitude ?? body.lng);
  if (!riderId || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json(
      { ok: false, error: "riderId, latitude, longitude required" },
      { status: 400 },
    );
  }
  const result = deliveryDb.pingGps({
    riderId,
    lat,
    lng,
    speed: body.speed,
    heading: body.heading,
    battery: body.battery,
  });
  if (!result) {
    return NextResponse.json({ ok: false, error: "Rider not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, rider: publicRider(result.rider) });
}

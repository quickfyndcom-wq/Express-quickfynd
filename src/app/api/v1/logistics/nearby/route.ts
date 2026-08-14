import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";
import type { VehicleType } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat") ?? 11.2588);
  const lng = Number(req.nextUrl.searchParams.get("lng") ?? 75.7804);
  const vehicle = (req.nextUrl.searchParams.get("vehicle") ?? undefined) as
    | VehicleType
    | undefined;
  const nearby = deliveryDb.nearbyPartners({ lat, lng }, vehicle);
  const summary = deliveryDb.availabilitySummary({ lat, lng });
  return NextResponse.json({ ok: true, pickup: { lat, lng }, summary, ...nearby });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const lat = Number(body.lat ?? body.pickup?.lat ?? 11.2588);
  const lng = Number(body.lng ?? body.pickup?.lng ?? 75.7804);
  const vehicle = (body.vehicle ?? undefined) as VehicleType | undefined;
  const nearby = deliveryDb.nearbyPartners({ lat, lng }, vehicle);
  const summary = deliveryDb.availabilitySummary({ lat, lng });
  return NextResponse.json({ ok: true, pickup: { lat, lng }, summary, ...nearby });
}

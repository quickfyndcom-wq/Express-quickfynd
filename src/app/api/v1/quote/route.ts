import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pickup = {
    lat: Number(body.pickup?.lat ?? body.pickupLat ?? 11.2588),
    lng: Number(body.pickup?.lng ?? body.pickupLng ?? 75.7804),
  };
  const drop = {
    lat: Number(body.drop?.lat ?? body.dropLat ?? 11.18),
    lng: Number(body.drop?.lng ?? body.dropLng ?? 75.83),
  };
  const price = deliveryDb.quote({
    pickup,
    drop,
    weightKg: Number(body.weightKg ?? body.package?.weightKg ?? 1),
    deliveryType: body.deliveryType ?? "standard",
    paymentType: body.paymentType ?? body.payment?.type ?? "prepaid",
    vehicle: body.vehicle ?? "bike",
  });
  return NextResponse.json({ ok: true, price });
}

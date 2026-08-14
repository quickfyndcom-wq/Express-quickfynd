import { NextRequest, NextResponse } from "next/server";
import {
  deliveryDb,
  recommendVehicle,
  serviceForVehicle,
  type VehicleType,
} from "@/lib/delivery";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pickup = {
    lat: Number(body.pickup?.lat ?? 11.2588),
    lng: Number(body.pickup?.lng ?? 75.7804),
  };
  const drop = {
    lat: Number(body.drop?.lat ?? 11.18),
    lng: Number(body.drop?.lng ?? 75.83),
  };
  const weightKg = Number(body.weightKg ?? body.package?.weightKg ?? 1);
  const goods = String(body.goods ?? body.package?.type ?? "Documents");
  const recommended = recommendVehicle(weightKg, goods);
  const vehicles = Array.from(
    new Set<VehicleType>([recommended, "bike", "scooter", "auto", "van", "truck"]),
  );

  const quotes = vehicles.map((vehicle) => {
    const price = deliveryDb.quote({
      pickup,
      drop,
      weightKg,
      deliveryType: body.deliveryType ?? "standard",
      paymentType: body.paymentType ?? "prepaid",
      vehicle,
    });
    return {
      vehicle,
      service: serviceForVehicle(vehicle),
      recommended: vehicle === recommended,
      price,
      pickupEtaMin: 4,
      deliveryEtaMin: Math.max(18, Math.round(price.distanceKm * 2.4)),
    };
  });

  return NextResponse.json({
    ok: true,
    recommended,
    quotes,
    fare: quotes.find((q) => q.recommended) ?? quotes[0],
  });
}

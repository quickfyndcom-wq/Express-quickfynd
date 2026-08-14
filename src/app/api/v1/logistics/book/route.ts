import { NextRequest, NextResponse } from "next/server";
import { customerDelivery, deliveryDb } from "@/lib/delivery";
import type { VehicleType } from "@/lib/delivery";

export const runtime = "nodejs";

function addr(
  raw: Record<string, unknown>,
  fallback: { line: string; city: string; lat: number; lng: number; pincode: string },
) {
  return {
    name: String(raw.name ?? ""),
    phone: String(raw.phone ?? ""),
    line: String(raw.line ?? raw.address ?? raw.building ?? fallback.line),
    city: String(raw.city ?? fallback.city),
    pincode: String(raw.pincode ?? fallback.pincode),
    lat: Number(raw.lat ?? fallback.lat),
    lng: Number(raw.lng ?? fallback.lng),
    instructions: raw.instructions ? String(raw.instructions) : undefined,
  };
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone") ?? undefined;
  const status = req.nextUrl.searchParams.get("status") as
    | "active"
    | "unassigned"
    | undefined;
  const list = deliveryDb.listDeliveries({
    source: "public",
    phone,
    status,
    q: req.nextUrl.searchParams.get("q") ?? undefined,
  });
  return NextResponse.json({
    ok: true,
    count: list.length,
    bookings: list.map((d) =>
      customerDelivery(d, d.riderId ? deliveryDb.findRider(d.riderId) : null),
    ),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pickup = addr(body.pickup ?? {}, {
    line: "Kozhikode",
    city: "Kozhikode",
    lat: 11.2588,
    lng: 75.7804,
    pincode: "673001",
  });
  const drop = addr(body.drop ?? body.customer ?? {}, {
    line: "Feroke",
    city: "Kozhikode",
    lat: 11.18,
    lng: 75.83,
    pincode: "673631",
  });

  if (!pickup.name || !pickup.phone || !drop.name || !drop.phone) {
    return NextResponse.json(
      { ok: false, error: "Pickup and drop name/phone are required" },
      { status: 400 },
    );
  }

  const extras = Array.isArray(body.stops) ? body.stops : [];
  const stopNote =
    extras.length > 0
      ? `Stops: ${extras.map((s: { line?: string; city?: string }) => s.line ?? s.city).join(" → ")}`
      : "";
  const flags = [
    body.fragile ? "Fragile" : "",
    body.handleWithCare ? "Handle with care" : "",
    body.keepUpright ? "Keep upright" : "",
    body.liquid ? "Liquid" : "",
    body.requiresHelper ? "Requires helper" : "",
  ]
    .filter(Boolean)
    .join(", ");

  const choose = body.assignMode === "choose" && Boolean(body.preferredRiderId);

  const delivery = deliveryDb.createDelivery({
    companyId: "co_quickfynd",
    source: "public",
    orderId: body.orderId,
    pickup,
    customer: drop,
    package: {
      type: body.goods ?? body.package?.type ?? "parcel",
      weightKg: Number(body.weightKg ?? body.package?.weightKg ?? 1),
      lengthCm: Number(body.lengthCm ?? body.package?.lengthCm ?? 0) || undefined,
      widthCm: Number(body.widthCm ?? body.package?.widthCm ?? 0) || undefined,
      heightCm: Number(body.heightCm ?? body.package?.heightCm ?? 0) || undefined,
      count: Number(body.packages ?? body.package?.count ?? 1),
      fragile: Boolean(body.fragile ?? body.package?.fragile),
      instructions: [body.instructions, flags, stopNote].filter(Boolean).join(" · "),
    },
    payment: {
      type: body.payment?.type === "cod" ? "cod" : "prepaid",
      amount: Number(body.payment?.amount ?? 0),
    },
    deliveryType: body.deliveryType ?? "express",
    vehicle: (body.vehicle ?? "bike") as VehicleType,
    assignMode: choose ? "choose" : "quick",
    preferredRiderId: choose ? String(body.preferredRiderId) : undefined,
    autoDispatch: !choose,
  });

  const rider = delivery.riderId
    ? deliveryDb.findRider(delivery.riderId)
    : delivery.offeredRiderId
      ? deliveryDb.findRider(delivery.offeredRiderId)
      : null;

  return NextResponse.json(
    {
      ok: true,
      awb: delivery.awb,
      tracking_url: `/track/${delivery.awb}`,
      booking: customerDelivery(delivery, rider),
    },
    { status: 201 },
  );
}

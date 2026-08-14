import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pickup = body.pickup ?? {};
  const drop = body.drop ?? body.customer ?? {};

  if (!pickup.name || !pickup.phone || !drop.name || !drop.phone) {
    return NextResponse.json(
      { ok: false, error: "Pickup and drop name/phone are required" },
      { status: 400 },
    );
  }

  const delivery = deliveryDb.createDelivery({
    companyId: "co_quickfynd",
    source: "public",
    orderId: body.orderId,
    pickup: {
      name: String(pickup.name),
      phone: String(pickup.phone),
      line: String(pickup.line ?? pickup.address ?? pickup.city ?? "Kozhikode"),
      city: pickup.city ?? "Kozhikode",
      pincode: pickup.pincode ?? "673001",
      lat: pickup.lat ?? 11.2588,
      lng: pickup.lng ?? 75.7804,
    },
    customer: {
      name: String(drop.name),
      phone: String(drop.phone),
      line: String(drop.line ?? drop.address ?? drop.city ?? "Feroke"),
      city: drop.city ?? "Kozhikode",
      pincode: drop.pincode ?? "673631",
      lat: drop.lat ?? 11.18,
      lng: drop.lng ?? 75.83,
    },
    package: {
      type: body.package?.type ?? "parcel",
      weightKg: body.package?.weightKg ?? 1,
      count: 1,
      fragile: Boolean(body.package?.fragile),
    },
    payment: { type: body.payment?.type ?? "prepaid", amount: 0 },
    deliveryType: body.deliveryType ?? "standard",
    vehicle: body.vehicle ?? "bike",
    autoDispatch: true,
  });

  return NextResponse.json(
    {
      ok: true,
      delivery_id: delivery.id,
      awb: delivery.awb,
      tracking_url: `/track/${delivery.awb}`,
      price: delivery.price,
      delivery,
    },
    { status: 201 },
  );
}

import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";
import type { DeliveryStatus } from "@/lib/delivery";

export const runtime = "nodejs";

function companyFrom(req: NextRequest) {
  return (
    req.headers.get("x-org-id") ||
    req.headers.get("x-org-slug") ||
    req.nextUrl.searchParams.get("company") ||
    req.nextUrl.searchParams.get("org") ||
    undefined
  );
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as
    | DeliveryStatus
    | "active"
    | "unassigned"
    | null;
  const list = deliveryDb.listDeliveries({
    companyId: companyFrom(req),
    sellerId: req.nextUrl.searchParams.get("seller") ?? undefined,
    status: status ?? undefined,
    source: (req.nextUrl.searchParams.get("source") as never) ?? undefined,
    q: req.nextUrl.searchParams.get("q") ?? undefined,
  });
  return NextResponse.json({
    ok: true,
    count: list.length,
    stats: deliveryDb.stats(companyFrom(req)),
    deliveries: list,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pickup = body.pickup ?? {};
  const customer = body.customer ?? body.drop ?? {};
  const pkg = body.package ?? {};
  const payment = body.payment ?? {};

  const pickupName = String(pickup.name ?? "").trim();
  const pickupPhone = String(pickup.phone ?? "").trim();
  const pickupLine = String(pickup.line ?? pickup.address ?? "").trim();
  const customerName = String(customer.name ?? body.consigneeName ?? "").trim();
  const customerPhone = String(customer.phone ?? body.consigneePhone ?? "").trim();
  const customerLine = String(
    customer.line ?? customer.address ?? body.destination ?? "",
  ).trim();

  if (!pickupName || !pickupPhone || !pickupLine || !customerName || !customerPhone || !customerLine) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Required: pickup.name, pickup.phone, pickup.address, customer.name, customer.phone, customer.address",
      },
      { status: 400 },
    );
  }

  const companyId =
    body.companyId ??
    body.company_id ??
    companyFrom(req) ??
    "co_quickfynd";

  const delivery = deliveryDb.createDelivery({
    companyId,
    sellerId: body.sellerId,
    source: body.source ?? (body.order_id || body.orderId ? "company_api" : "manual"),
    orderId: body.order_id ?? body.orderId ?? body.reference,
    pickup: {
      name: pickupName,
      phone: pickupPhone,
      line: pickupLine,
      city: pickup.city,
      pincode: pickup.pincode ?? pickup.pin,
      lat: pickup.latitude ?? pickup.lat,
      lng: pickup.longitude ?? pickup.lng,
      instructions: pickup.instructions,
    },
    customer: {
      name: customerName,
      phone: customerPhone,
      line: customerLine,
      city: customer.city,
      pincode: customer.pincode ?? body.pincode,
      lat: customer.latitude ?? customer.lat,
      lng: customer.longitude ?? customer.lng,
      instructions: customer.instructions,
    },
    package: {
      type: pkg.type,
      weightKg: pkg.weight ?? pkg.weightKg ?? body.weightKg,
      lengthCm: pkg.lengthCm ?? pkg.length,
      widthCm: pkg.widthCm ?? pkg.width,
      heightCm: pkg.heightCm ?? pkg.height,
      count: pkg.count ?? pkg.numberOfPackages ?? 1,
      fragile: pkg.fragile,
      instructions: pkg.instructions ?? body.instructions,
    },
    payment: {
      type: payment.type ?? (Number(payment.amount ?? body.codAmount) > 0 ? "cod" : "prepaid"),
      amount: payment.amount ?? body.codAmount ?? 0,
    },
    deliveryType: body.deliveryType ?? body.delivery_type ?? "standard",
    vehicle: body.vehicle ?? pkg.vehicle ?? "bike",
    scheduledAt: body.scheduledAt,
    autoDispatch: body.autoDispatch !== false,
  });

  return NextResponse.json(
    {
      ok: true,
      delivery_id: delivery.id,
      deliveryId: delivery.id,
      awb: delivery.awb,
      tracking_url: `/track/${delivery.awb}`,
      trackingUrl: `/track/${delivery.awb}`,
      status: delivery.status,
      price: delivery.price,
      delivery,
    },
    { status: 201 },
  );
}

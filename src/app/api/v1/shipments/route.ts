import { NextRequest, NextResponse } from "next/server";
import {
  courierDb,
  createShipmentFromOrder,
  getOrg,
  orgShipments,
} from "@/lib/courier-store";
import { deliveryDb } from "@/lib/delivery";

function resolveOrg(req: NextRequest) {
  const key =
    req.headers.get("x-org-id") ||
    req.headers.get("x-org-slug") ||
    req.nextUrl.searchParams.get("org") ||
    "quickfynd";
  return getOrg(key) ?? deliveryDb.findCompany(key);
}

/** List shipments (tenant-scoped with x-org-slug) */
export async function GET(req: NextRequest) {
  const key =
    req.headers.get("x-org-id") ||
    req.headers.get("x-org-slug") ||
    req.nextUrl.searchParams.get("org");
  const org = key ? resolveOrg(req) : null;
  const fromCourier = org && "walletBalance" in org && courierDb.organizations.length
    ? orgShipments(org.id)
    : [];
  const fromDelivery = deliveryDb.listDeliveries({
    companyId: org?.id ?? key ?? undefined,
  });

  return NextResponse.json({
    ok: true,
    count: fromCourier.length + fromDelivery.length,
    shipments: fromCourier,
    deliveries: fromDelivery,
  });
}

/**
 * Website → Courier API
 * Creates shipment, generates tracking number, creates pickup request.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key =
    req.headers.get("x-org-id") ||
    req.headers.get("x-org-slug") ||
    req.nextUrl.searchParams.get("org") ||
    body.companyId ||
    "quickfynd";
  const org = getOrg(key);
  const company = deliveryDb.ensureCompany({
    id: org?.id,
    slug: org?.slug ?? String(key),
    name: org?.name ?? String(key),
    contactEmail: org?.contactEmail,
  });

  const consigneeName = String(body.consigneeName ?? body.customerName ?? body.customer?.name ?? "").trim();
  const consigneePhone = String(body.consigneePhone ?? body.phone ?? body.customer?.phone ?? "").trim();
  const destination = String(body.destination ?? body.address ?? body.customer?.address ?? "").trim();
  const pincode = String(body.pincode ?? body.customer?.pincode ?? "").trim();

  if (!consigneeName || !consigneePhone || !destination) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Required: consigneeName, consigneePhone, destination",
      },
      { status: 400 },
    );
  }

  const pickup = body.pickup ?? {};
  const delivery = deliveryDb.createDelivery({
    companyId: company.id,
    source: "company_api",
    orderId: body.reference ?? body.orderId,
    pickup: {
      name: String(pickup.name ?? company.name),
      phone: String(pickup.phone ?? company.contactPhone ?? "0000000000"),
      line: String(pickup.address ?? pickup.line ?? `${company.name} warehouse`),
      city: pickup.city ?? "Kozhikode",
      pincode: pickup.pincode ?? "673001",
      lat: pickup.latitude ?? pickup.lat,
      lng: pickup.longitude ?? pickup.lng,
    },
    customer: {
      name: consigneeName,
      phone: consigneePhone,
      line: destination,
      pincode: pincode || "673001",
      lat: body.customer?.lat,
      lng: body.customer?.lng,
    },
    package: { weightKg: Number(body.weightKg ?? body.package?.weight ?? 1), count: 1, type: "parcel", fragile: false },
    payment: {
      type: Number(body.codAmount ?? body.payment?.amount ?? 0) > 0 ? "cod" : "prepaid",
      amount: Number(body.codAmount ?? body.payment?.amount ?? 0),
    },
    autoDispatch: true,
  });

  let shipment = null;
  if (org) {
    const result = createShipmentFromOrder({
      orgId: org.id,
      reference: body.reference ? String(body.reference) : body.orderId ? String(body.orderId) : undefined,
      consigneeName,
      consigneePhone,
      destination,
      pincode: pincode || "673001",
      codAmount: Number(body.codAmount ?? 0),
      weightKg: Number(body.weightKg ?? 1),
    });
    shipment = result.shipment;
  }

  return NextResponse.json(
    {
      ok: true,
      flow: [
        "Website confirmed order",
        "Website sent order to Courier API",
        "QuickFynd Express created shipment",
        "Tracking number generated",
        "Tracking number returned to website",
        "Pickup request created",
      ],
      awb: delivery.awb,
      trackingNumber: delivery.awb,
      trackingUrl: `/track/${delivery.awb}`,
      bookingNo: shipment?.bookingNo ?? delivery.orderId,
      status: delivery.status,
      shipment: shipment ?? delivery,
      delivery,
      pickup: { status: delivery.status, message: "Pickup request created — rider search started" },
      webhook: { event: "shipment.created", data: { awb: delivery.awb, status: delivery.status } },
      next: {
        assignRider: `POST /api/v1/deliveries/${delivery.awb}/dispatch`,
        track: `/track/${delivery.awb}`,
      },
    },
    { status: 201 },
  );
}

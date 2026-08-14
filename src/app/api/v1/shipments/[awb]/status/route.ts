import { NextRequest, NextResponse } from "next/server";
import {
  advanceShipmentStatus,
  findShipmentByAwb,
  type ShipmentStatus,
} from "@/lib/courier-store";
import { deliveryDb, type DeliveryStatus } from "@/lib/delivery";

type Ctx = { params: Promise<{ awb: string }> };

/**
 * Advance shipment along the courier lifecycle and return webhook payload
 * that should be posted back to the merchant website.
 *
 * Body (optional): { status?: ShipmentStatus, riderId?: string }
 * If status omitted, advances one step:
 * awaiting_pickup → picked_up → at_hub → in_transit → out_for_delivery → delivered
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  const { awb: raw } = await ctx.params;
  const awb = decodeURIComponent(raw);
  const existing = findShipmentByAwb(awb);
  const live = deliveryDb.findDelivery(awb);
  if (!existing && !live) {
    return NextResponse.json({ ok: false, error: "Shipment not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const next = body.status as ShipmentStatus | undefined;
  const result = existing
    ? advanceShipmentStatus(awb, next, body.riderId ? String(body.riderId) : undefined)
    : null;
  const mapped: Record<string, DeliveryStatus> = {
    awaiting_pickup: "ready_for_pickup",
    picked_up: "picked_up",
    at_hub: "in_transit",
    in_transit: "in_transit",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
    failed: "failed",
    returned: "returned",
  };
  const deliveryUpdate = live
    ? deliveryDb.setStatus(awb, mapped[String(next ?? "")] ?? undefined, {
        note: "Advanced from shipments API",
      })
    : null;

  if (!result && !deliveryUpdate) {
    return NextResponse.json({ ok: false, error: "Unable to update" }, { status: 400 });
  }

  const flowHints: Record<string, string> = {
    awaiting_pickup: "Pickup request active — assign rider",
    picked_up: "Parcel picked up — live tracking starts",
    at_hub: "At hub — sorting",
    in_transit: "In transit",
    out_for_delivery: "Courier rider out for delivery",
    delivered: "Parcel delivered — status sent back to website",
    failed: "Failed delivery reported",
    returned: "Returned to origin",
  };

  return NextResponse.json({
    ok: true,
    shipment: result?.shipment ?? deliveryUpdate?.delivery,
    message: flowHints[result?.shipment.status ?? ""] ?? "Status updated",
    webhook: result?.webhook ?? {
      event: `order.${deliveryUpdate?.delivery.status}`,
      data: { awb, status: deliveryUpdate?.delivery.status },
    },
    deliverToWebsite: {
      method: "POST",
      description:
        "Merchant website should receive this webhook payload on their configured URL",
      payload: result?.webhook ?? {
        event: `order.${deliveryUpdate?.delivery.status}`,
        data: { awb, status: deliveryUpdate?.delivery.status },
      },
    },
  });
}

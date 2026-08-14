import { NextResponse } from "next/server";
import { deliveryDb, TRACK_STEPS } from "@/lib/delivery";
import { courierDb } from "@/lib/courier-store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ awb: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { awb } = await ctx.params;
  const code = decodeURIComponent(awb);
  const tracked = deliveryDb.track(code);
  if (tracked) {
    const idx = TRACK_STEPS.findIndex((s) =>
      tracked.delivery.history.some((h) => h.status === s.status) ||
      tracked.delivery.status === s.status,
    );
    const currentIdx = Math.max(
      idx,
      TRACK_STEPS.findIndex((s) => s.status === tracked.delivery.status),
    );
    return NextResponse.json({
      ok: true,
      awb: tracked.delivery.awb,
      status: tracked.delivery.status,
      consignee: tracked.delivery.drop.name,
      destination: tracked.delivery.drop.line,
      pickup: tracked.delivery.pickup,
      drop: tracked.delivery.drop,
      package: tracked.delivery.package,
      payment: tracked.delivery.payment,
      price: tracked.delivery.price,
      remainingKm: tracked.remainingKm,
      etaMinutes: tracked.etaMinutes,
      stopsBefore: tracked.delivery.stopsBefore,
      rider: tracked.rider,
      lastGps: tracked.lastGps,
      history: tracked.delivery.history,
      timeline: TRACK_STEPS.map((step, i) => ({
        status: step.status,
        label: step.label,
        done:
          tracked.delivery.status === "delivered" ||
          tracked.delivery.history.some((h) => h.status === step.status) ||
          (currentIdx >= 0 && i <= currentIdx),
      })),
      delivery: tracked.delivery,
    });
  }

  const shipment = courierDb.shipments.find(
    (s) => s.awb.toUpperCase() === code.toUpperCase(),
  );
  if (!shipment) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    awb: shipment.awb,
    status: shipment.status,
    consignee: shipment.consigneeName,
    destination: shipment.destination,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { customerDelivery, deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const awb = String(body.awb ?? body.id ?? "");
  const riderId = String(body.riderId ?? "");
  const mode = String(body.mode ?? "choose");

  const d = deliveryDb.findDelivery(awb);
  if (!d) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }

  if (mode === "quick" || body.findAnother) {
    const result = deliveryDb.dispatch(d.id);
    const offered = result?.offered ?? null;
    return NextResponse.json({
      ok: true,
      mode: "quick",
      booking: customerDelivery(d, offered),
      offered: offered ? { id: offered.id, firstName: offered.firstName } : null,
    });
  }

  if (!riderId) {
    return NextResponse.json({ ok: false, error: "riderId required" }, { status: 400 });
  }

  const result = deliveryDb.requestRider(d.id, riderId);
  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      error: result.error,
      fallback: true,
      message: `${deliveryDb.findRider(riderId)?.firstName ?? "That partner"} is unavailable. Find another nearby partner?`,
      booking: customerDelivery(d, null),
    });
  }

  return NextResponse.json({
    ok: true,
    mode: "choose",
    booking: customerDelivery(d, result.offered),
  });
}

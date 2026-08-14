import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const awb = String(body.awb ?? body.id ?? "");
  const overall = Number(body.overall ?? body.stars ?? 0);
  if (!awb || overall < 1 || overall > 5) {
    return NextResponse.json(
      { ok: false, error: "awb and overall rating 1–5 required" },
      { status: 400 },
    );
  }
  const rating = deliveryDb.rateDelivery(awb, {
    overall,
    partner: body.partner ? Number(body.partner) : undefined,
    speed: body.speed ? Number(body.speed) : undefined,
    handling: body.handling ? Number(body.handling) : undefined,
    behaviour: body.behaviour ? Number(body.behaviour) : undefined,
    tipInr: body.tipInr ? Number(body.tipInr) : undefined,
    note: body.note ? String(body.note) : undefined,
  });
  if (!rating) {
    return NextResponse.json({ ok: false, error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, rating });
}

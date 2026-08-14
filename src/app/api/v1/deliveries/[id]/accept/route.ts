import { NextRequest, NextResponse } from "next/server";
import { deliveryDb, publicRider } from "@/lib/delivery";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const riderId = String(body.riderId ?? body.rider_id ?? "");
  if (!riderId) {
    return NextResponse.json({ ok: false, error: "riderId required" }, { status: 400 });
  }
  const accepted = body.accept !== false && body.decline !== true;
  const result = accepted
    ? deliveryDb.accept(decodeURIComponent(id), riderId)
    : deliveryDb.decline(decodeURIComponent(id), riderId);
  if (!result) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    accepted,
    delivery: "delivery" in result ? result.delivery : result,
    rider: "rider" in result && result.rider ? publicRider(result.rider) : null,
  });
}

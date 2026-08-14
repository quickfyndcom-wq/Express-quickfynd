import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";
import type { DeliveryStatus } from "@/lib/delivery";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const status = body.status as DeliveryStatus | undefined;
  const result = deliveryDb.setStatus(decodeURIComponent(id), status, {
    failReason: body.failReason ?? body.reason,
    note: body.note,
  });
  if (!result) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    webhook: {
      event: `order.${result.delivery.status}`,
      awb: result.delivery.awb,
      status: result.delivery.status,
    },
    delivery: result.delivery,
  });
}

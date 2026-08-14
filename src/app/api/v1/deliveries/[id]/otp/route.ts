import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const kind = body.kind === "pickup" ? "pickup" : "delivery";
  if (body.code) {
    const result = deliveryDb.verifyOtp(decodeURIComponent(id), kind, String(body.code));
    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }
    return NextResponse.json(result);
  }
  const sent = deliveryDb.sendOtp(decodeURIComponent(id), kind);
  if (!sent) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, ...sent });
}

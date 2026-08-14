import { NextResponse } from "next/server";
import { deliveryDb, publicRider } from "@/lib/delivery";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const result = deliveryDb.dispatch(decodeURIComponent(id));
  if (!result) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    delivery: result.delivery,
    offered: result.offered ? publicRider(result.offered) : null,
    candidates: result.candidates.map((row) => ({
      rider: publicRider(row.rider),
      score: row.score,
      distanceKm: Number(row.distanceKm.toFixed(2)),
    })),
  });
}

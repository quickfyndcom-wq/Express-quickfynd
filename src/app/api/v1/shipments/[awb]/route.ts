import { NextResponse } from "next/server";
import { courierDb } from "@/lib/courier-store";

type Ctx = { params: Promise<{ awb: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { awb } = await ctx.params;
  const shipment = courierDb.shipments.find(
    (s) => s.awb.toUpperCase() === decodeURIComponent(awb).toUpperCase(),
  );
  if (!shipment) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const org = courierDb.organizations.find((o) => o.id === shipment.orgId);
  return NextResponse.json({ ok: true, shipment, organization: org?.name });
}

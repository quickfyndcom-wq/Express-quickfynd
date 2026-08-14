import { NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

/** Operational snapshot for Super Admin — delivery engine is the source of truth. */
export async function GET() {
  const live = deliveryDb.liveOps();
  const stats = deliveryDb.stats();
  return NextResponse.json({
    ok: true,
    shipments: deliveryDb.deliveries.map((d) => ({
      id: d.id,
      awb: d.awb,
      org_id: d.companyId,
      orgId: d.companyId,
      status: d.status,
      cod_amount: d.payment.type === "cod" ? d.payment.amount : 0,
      codAmount: d.payment.type === "cod" ? d.payment.amount : 0,
    })),
    hubs: deliveryDb.zones.map((z) => ({ id: z.id, name: z.name, city: z.city })),
    riders: deliveryDb.riders.map((r) => ({
      id: r.id,
      name: r.name,
      vehicle: r.vehicle,
      online: r.online,
      duty: r.duty,
    })),
    tickets: deliveryDb.tickets,
    invoices: deliveryDb.companies.map((c) => ({
      id: `inv_${c.id}`,
      status: c.codBalance > 0 ? "due" : "paid",
      company: c.name,
    })),
    organizations: deliveryDb.companies,
    deliveries: deliveryDb.deliveries,
    live,
    stats,
  });
}

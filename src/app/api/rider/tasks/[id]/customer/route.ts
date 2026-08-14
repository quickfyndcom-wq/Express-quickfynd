import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const pickup = db.pickups.find((p) => p.id === id && p.riderId === rider.id);
  const delivery = db.deliveries.find((d) => d.id === id && d.riderId === rider.id);
  const task = pickup ?? delivery;
  if (!task) {
    return NextResponse.json({ ok: false, error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    customer: {
      name: "merchantName" in task ? task.merchantName : task.customerName,
      phone: task.phone,
      telUrl: `tel:${task.phone}`,
    },
  });
}

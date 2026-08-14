import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const task =
    db.pickups.find((p) => p.id === id && p.riderId === rider.id) ??
    db.deliveries.find((d) => d.id === id && d.riderId === rider.id);

  if (!task) {
    return NextResponse.json({ ok: false, error: "Task not found" }, { status: 404 });
  }

  const origin = [...db.gpsPings].reverse().find((g) => g.riderId === rider.id) ?? {
    lat: 9.9816,
    lng: 76.2999,
  };

  return NextResponse.json({
    ok: true,
    navigation: {
      taskId: task.id,
      destination: {
        address: task.address,
        lat: task.lat,
        lng: task.lng,
      },
      origin: { lat: origin.lat, lng: origin.lng },
      mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${task.lat},${task.lng}`,
      deepLink: `geo:${task.lat},${task.lng}?q=${encodeURIComponent(task.address)}`,
    },
  });
}

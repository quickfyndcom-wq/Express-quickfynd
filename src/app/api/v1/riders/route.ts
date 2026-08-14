import { NextRequest, NextResponse } from "next/server";
import { deliveryDb, publicRider } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const online = req.nextUrl.searchParams.get("online");
  let list = deliveryDb.riders.map(publicRider);
  if (online === "1") list = list.filter((r) => r.online);
  if (online === "0") list = list.filter((r) => !r.online);
  return NextResponse.json({ ok: true, count: list.length, riders: list });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (body.riderId && typeof body.online === "boolean") {
    const rider = deliveryDb.setRiderOnline(String(body.riderId), body.online);
    if (!rider) {
      return NextResponse.json({ ok: false, error: "Rider not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, rider: publicRider(rider) });
  }
  return NextResponse.json({ ok: false, error: "riderId and online required" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id || !deliveryDb.removeRider(id)) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

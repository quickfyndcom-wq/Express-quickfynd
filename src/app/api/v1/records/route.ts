import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "delivery";
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
  }
  const removed = deliveryDb.removeRecord(type, id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

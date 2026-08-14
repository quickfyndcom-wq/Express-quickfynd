import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const owner = req.nextUrl.searchParams.get("owner") ?? "guest";
  return NextResponse.json({ ok: true, places: deliveryDb.listPlaces(owner) });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const owner = String(body.owner ?? "guest");
  if (!body.label || !body.line) {
    return NextResponse.json({ ok: false, error: "label and line required" }, { status: 400 });
  }
  const place = deliveryDb.savePlace(owner, {
    label: String(body.label),
    line: String(body.line),
    city: String(body.city ?? "Kozhikode"),
    lat: Number(body.lat ?? 11.2588),
    lng: Number(body.lng ?? 75.7804),
    pincode: body.pincode ? String(body.pincode) : undefined,
  });
  return NextResponse.json({ ok: true, place }, { status: 201 });
}

import { NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, ...deliveryDb.liveOps() });
}

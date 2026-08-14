import { NextResponse } from "next/server";
import { getOpsData } from "@/lib/ops";

export async function GET() {
  return NextResponse.json(getOpsData());
}

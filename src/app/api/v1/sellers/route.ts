import { NextRequest, NextResponse } from "next/server";
import { deliveryDb } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const company = req.nextUrl.searchParams.get("company") ?? undefined;
  const list = company
    ? deliveryDb.sellers.filter(
        (s) => s.companyId === (deliveryDb.findCompany(company)?.id ?? company),
      )
    : deliveryDb.sellers;
  return NextResponse.json({ ok: true, sellers: list });
}

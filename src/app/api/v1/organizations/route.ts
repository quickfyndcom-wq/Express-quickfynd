import { NextResponse } from "next/server";
import { courierDb } from "@/lib/courier-store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    organizations: courierDb.organizations.map((o) => ({
      id: o.id,
      name: o.name,
      slug: o.slug,
      type: o.type,
      status: o.status,
    })),
  });
}

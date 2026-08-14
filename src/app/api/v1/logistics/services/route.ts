import { NextResponse } from "next/server";
import { GOODS_TYPES, LOGISTICS_SERVICES, PLACES } from "@/lib/delivery";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    services: LOGISTICS_SERVICES,
    goods: GOODS_TYPES,
    places: PLACES,
    payments: ["upi", "card", "wallet", "cash", "business"],
    assignModes: [
      {
        id: "quick",
        name: "Find My Driver",
        recommended: true,
        blurb: "Automatically assign the best nearby delivery partner.",
      },
      {
        id: "choose",
        name: "Choose Delivery Partner",
        recommended: false,
        blurb: "Pick from available partners. They still need to accept.",
      },
    ],
  });
}

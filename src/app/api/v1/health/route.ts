import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "QuickFynd Delivery API",
    version: "v1",
    poweredBy: "Nilaas",
    endpoints: [
      "GET /api/v1/health",
      "GET /api/v1/logistics/services",
      "POST /api/v1/logistics/quote",
      "POST /api/v1/logistics/nearby",
      "POST /api/v1/logistics/book",
      "GET /api/v1/track/:awb",
      "GET|POST /api/v1/deliveries",
      "GET /api/v1/ops/live",
      "GET /developers",
    ],
  });
}

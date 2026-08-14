import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "QuickFynd Delivery API",
    version: "v1",
    poweredBy: "Nilaas",
    endpoints: [
      "GET /api/v1/health",
      "GET|POST /api/v1/deliveries",
      "GET /api/v1/deliveries/:id",
      "POST /api/v1/deliveries/:id/dispatch",
      "POST /api/v1/deliveries/:id/accept",
      "POST /api/v1/deliveries/:id/status",
      "POST /api/v1/deliveries/:id/otp",
      "POST /api/v1/quote",
      "POST /api/v1/public/book",
      "GET /api/v1/ops/live",
      "GET /api/v1/riders",
      "POST /api/v1/riders/gps",
      "GET /api/v1/track/:awb",
      "GET /api/v1/zones",
      "GET /api/v1/sellers",
    ],
  });
}

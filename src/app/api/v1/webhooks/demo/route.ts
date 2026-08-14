import { NextRequest, NextResponse } from "next/server";

/**
 * Demo webhook receiver — in production this lives on the merchant website.
 * QuickFynd Express POSTs delivery status here after each milestone.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    received: true,
    at: new Date().toISOString(),
    note: "Website acknowledged courier status update",
    event: body.event ?? body,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "POST shipment status webhooks here from QuickFynd Express (demo sink).",
    events: [
      "shipment.created",
      "shipment.status_updated",
      "shipment.delivered",
    ],
  });
}

import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const taskId = String(body.taskId ?? "");
  const delivery = db.deliveries.find((d) => d.id === taskId && d.riderId === rider.id);
  if (!delivery) {
    return NextResponse.json({ ok: false, error: "Delivery not found" }, { status: 404 });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  db.otpStore.set(taskId, otp);

  // Demo: return OTP in response so Flutter can show it without SMS gateway
  return NextResponse.json({
    ok: true,
    sent: true,
    channel: "sms",
    phoneMasked: delivery.phone.replace(/\d(?=\d{4})/g, "*"),
    demoOtp: otp,
    message: "OTP sent to customer (demo OTP returned in response)",
  });
}

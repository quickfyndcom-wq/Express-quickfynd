import { NextRequest, NextResponse } from "next/server";
import { db, getRiderFromAuth } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const rider = getRiderFromAuth(req.headers.get("authorization"));
  if (!rider) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const taskId = String(body.taskId ?? "");
  const otp = String(body.otp ?? "");
  const expected = db.otpStore.get(taskId);

  if (!expected || expected !== otp) {
    return NextResponse.json({ ok: false, error: "Invalid OTP" }, { status: 400 });
  }

  db.otpStore.delete(taskId);
  return NextResponse.json({ ok: true, verified: true });
}

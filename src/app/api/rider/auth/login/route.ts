import { NextRequest, NextResponse } from "next/server";
import { db, publicRider } from "@/lib/rider-store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const rider = db.riders.find(
    (r) => r.email.toLowerCase() === email && r.password === password,
  );

  if (!rider) {
    return NextResponse.json(
      { ok: false, error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const token = `tok_${db.id("sess")}`;
  db.sessions.set(token, rider.id);

  return NextResponse.json({
    ok: true,
    token,
    rider: publicRider(rider),
  });
}

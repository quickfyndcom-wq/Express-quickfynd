import { NextResponse } from "next/server";

/** Legacy Supabase OAuth callback — login now uses Firebase popup. */
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/login`);
}

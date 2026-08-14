import { NextResponse, type NextRequest } from "next/server";

/** Pass-through — login uses Firebase client Auth; DB uses Supabase. */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

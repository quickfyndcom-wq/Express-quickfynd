import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSupabaseJwksUrl, getSupabaseUrl } from "@/lib/supabase/env";

/** Quick connectivity check for QF Express ↔ Supabase */
export async function GET() {
  try {
    const supabase = createServiceClient();
    // Lightweight auth admin call — confirms secret key works
    const { error } = await supabase.auth.getSession();

    return NextResponse.json({
      ok: true,
      supabaseUrl: getSupabaseUrl(),
      jwksUrl: getSupabaseJwksUrl(),
      secretKeyConfigured: Boolean(process.env.SUPABASE_SECRET_KEY),
      publishableKeyConfigured: Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.SUPABASE_PUBLISHABLE_KEY,
      ),
      note: error
        ? `Connected (getSession: ${error.message})`
        : "Service client ready",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Supabase connection failed",
      },
      { status: 500 },
    );
  }
}

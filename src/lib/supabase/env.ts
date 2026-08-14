/** Shared env helpers for Supabase */

export function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  );
}

export function getSupabasePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

/** Server-only — never import this into Client Components */
export function getSupabaseSecretKey() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing SUPABASE_SECRET_KEY");
  }
  return key;
}

export function getSupabaseJwksUrl() {
  return (
    process.env.SUPABASE_JWKS_URL ||
    `${getSupabaseUrl()}/auth/v1/.well-known/jwks.json`
  );
}

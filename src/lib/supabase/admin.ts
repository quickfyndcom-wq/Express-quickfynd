import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Service-role / secret client — bypasses RLS.
 * Use only in trusted server code (API routes, server actions).
 * Never import into Client Components.
 */
function timedFetch(input: RequestInfo | URL, init?: RequestInit) {
  return fetch(input, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(1500),
  });
}

export function tryCreateServiceClient() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: { fetch: timedFetch },
  });
}

export function createServiceClient() {
  const client = tryCreateServiceClient();
  if (!client) {
    throw new Error("Missing SUPABASE_SECRET_KEY");
  }
  return client;
}

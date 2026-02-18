import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con service role key.
 * Bypassa completamente RLS — usar SOLO en server-side (Route Handlers, Actions).
 * NUNCA importar desde código cliente.
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

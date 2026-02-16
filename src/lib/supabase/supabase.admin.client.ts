import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para admin
 * NO usa authStore, cookies independientes
 */
export const supabaseAdmin = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

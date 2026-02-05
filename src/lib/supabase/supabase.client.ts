// import { createBrowserClient } from "@supabase/ssr";
// import type { SupabaseClient } from "@supabase/supabase-js";

// let browserClient: SupabaseClient | null = null;

// export function getSupabaseBrowserClient() {
//   if (!browserClient) {
//     browserClient = createBrowserClient(
//       process.env.NEXT_PUBLIC_SUPABASE_URL!,
//       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     );
//   }
//   return browserClient;
// }

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // útil si usas magic link/OAuth
      storageKey: "promii:supabase.auth",
      // storage: window.localStorage (por defecto en browser)
    },
  }
);

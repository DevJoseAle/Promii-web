import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "promii:supabase.auth",
    },
    cookies: {
      // Configuración para que funcione con el middleware SSR
      get(name: string) {
        if (typeof document === "undefined") return undefined;
        const cookies = document.cookie.split("; ");
        const cookie = cookies.find((c) => c.startsWith(`${name}=`));
        return cookie?.split("=")[1];
      },
      set(name: string, value: string, options: any) {
        if (typeof document === "undefined") return;
        let cookie = `${name}=${value}`;
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
        if (options?.path) cookie += `; path=${options.path}`;
        if (options?.domain) cookie += `; domain=${options.domain}`;
        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
        if (options?.secure) cookie += "; secure";
        document.cookie = cookie;
      },
      remove(name: string, options: any) {
        if (typeof document === "undefined") return;
        document.cookie = `${name}=; max-age=0; path=${options?.path || "/"}`;
      },
    },
  }
);

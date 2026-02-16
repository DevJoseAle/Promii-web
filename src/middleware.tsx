import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ Refrescar sesión para mantener cookies sincronizadas
  const { data: { user } } = await supabase.auth.getUser();

  // 🔒 Proteger rutas /admin/*
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Si no hay usuario autenticado, redirigir a login admin
    if (!user) {
      console.log("🔒 [Middleware] No user, redirecting to login");
      return NextResponse.redirect(new URL("/4dm1n/login", request.url));
    }

    // Verificar que el usuario tenga role = "admin"
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("🔍 [Middleware] Admin check:", {
      userId: user.id,
      profile,
      profileError,
      hasProfile: !!profile,
      role: profile?.role,
    });

    // Si no es admin, redirigir a login admin
    if (!profile || profile.role !== "admin") {
      console.log("❌ [Middleware] NOT admin, redirecting to login", {
        hasProfile: !!profile,
        role: profile?.role,
      });
      return NextResponse.redirect(new URL("/4dm1n/login", request.url));
    }

    console.log("✅ [Middleware] Admin verified, allowing access");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
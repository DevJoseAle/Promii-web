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
      cookieOptions: {
        name: "promii-auth",
      },
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

  async function getProfileRole() {
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    return profile?.role ?? null;
  }

  const path = request.nextUrl.pathname;
  const isBusinessPath = path === "/business" || path.startsWith("/business/");
  const isInfluencerPortalPath = path === "/inf" || path.startsWith("/inf/");
  const isInfluencersDirectoryPath =
    path === "/influencers" || path.startsWith("/influencers/");

  if (isInfluencersDirectoryPath) {
    return response;
  }
  // 🔒 Proteger rutas /admin/**
  if (path.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/4dm1n/login", request.url));
    }
    const role = await getProfileRole();
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/4dm1n/login", request.url));
    }
  }

  const businessAuthPaths = new Set([
    "/business/sign-in",
    "/business/apply",
  ]);

  const influencerAuthPaths = new Set([
    "/inf/sign-in",
    "/inf/apply",
  ]);

  // 🔒 Proteger rutas /business/**
  if (isBusinessPath) {
    if (!user) {
      if (!businessAuthPaths.has(path)) {
        return NextResponse.redirect(new URL("/business/sign-in", request.url));
      }
    } else {
      const role = await getProfileRole();
      if (role !== "merchant") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (businessAuthPaths.has(path)) {
        return NextResponse.redirect(new URL("/business/dashboard", request.url));
      }
    }
  }

  // 🔒 Proteger rutas /inf/**
  if (isInfluencerPortalPath) {
    if (!user) {
      if (!influencerAuthPaths.has(path)) {
        return NextResponse.redirect(new URL("/inf/sign-in", request.url));
      }
    } else {
      const role = await getProfileRole();
      if (role !== "influencer") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (influencerAuthPaths.has(path)) {
        return NextResponse.redirect(new URL("/inf/dashboard", request.url));
      }
    }
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

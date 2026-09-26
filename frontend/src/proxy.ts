import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Routes that require specific roles
const roleRoutes: Record<string, string[]> = {
  "/customer": ["CUSTOMER"],
  "/worker": ["WORKER"],
  "/admin": ["ADMIN"],
};

// Public routes that don't require authentication
const publicRoutes = ["/", "/login", "/register", "/api/auth"];

export default auth((req) => {
  const { nextUrl } = req;
  const { pathname } = nextUrl;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role as string | undefined;

  // Allow public routes
  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Allow API auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow public API routes (categories, cooperatives)
  if (
    pathname === "/api/categories" || pathname.startsWith("/api/categories/") ||
    pathname === "/api/cooperatives" || pathname.startsWith("/api/cooperatives/") ||
    pathname === "/api/get-cooperatives" || pathname.startsWith("/api/get-cooperatives/")
  ) {
    return NextResponse.next();
  }

  const session = req.auth;

  // If not authenticated, redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        const redirectMap: Record<string, string> = {
          CUSTOMER: "/customer",
          WORKER: "/worker",
          ADMIN: "/admin",
        };
        const redirectPath = userRole ? redirectMap[userRole] || "/login" : "/login";
        return NextResponse.redirect(new URL(redirectPath, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

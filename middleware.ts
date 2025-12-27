import { NextRequest, NextResponse } from "next/server";

const adminRoutes = ["/admin"];
const protectedRoutes = [
  "/tournaments",
  "/teams",
  "/matches",
  "/fields",
  "/profile",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const role = request.cookies.get("user-role")?.value;

  // ✅ Admin protection FIRST (performance + security)
  if (
    adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route)) &&
    role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // ✅ Protected routes (requires auth token)
  if (
    protectedRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    ) &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Allow access
  return NextResponse.next();
}

// ✅ Performance optimization - only run on specified routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/tournaments/:path*",
    "/teams/:path*",
    "/matches/:path*",
    "/fields/:path*",
    "/profile",
  ],
};

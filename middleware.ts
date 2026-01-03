import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

function getCleanPath(pathname: string): string {
  return pathname.replace(/^\/(en|ar|it)(\/|$)/, "/");
}

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register"];
const ADMIN_PATHS = ["/admin"];
const PROTECTED_PATHS = ["/tournaments", "/teams", "/fields", "/profile"];

export function middleware(request: NextRequest) {
  // ✅ middleware()
  const pathname = request.nextUrl.pathname;
  console.log("🔍 PROXY:", pathname);

  // i18n first
  const i18nResponse = createMiddleware({
    locales: ["en", "ar", "it"],
    defaultLocale: "en",
  })(request);

  const cleanPath = getCleanPath(pathname);

  // Public
  if (
    PUBLIC_PATHS.some((p) => cleanPath === p || cleanPath.startsWith(p + "/"))
  ) {
    console.log("✅ PUBLIC");
    return i18nResponse; // ✅ Return i18n response
  }

  // Admin check
  if (ADMIN_PATHS.some((p) => cleanPath.startsWith(p))) {
    const role = request.cookies.get("user-role")?.value;
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Protected check
  if (PROTECTED_PATHS.some((p) => cleanPath.startsWith(p))) {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return i18nResponse; // ✅ Return i18n response
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)", // ✅ Better matcher
};

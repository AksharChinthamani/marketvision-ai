import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths through
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith("/_next") || pathname.startsWith("/favicon")
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Check for token in cookies (set by the app) or rely on client-side check
  // Since we use localStorage (client-only), we gate via a cookie set on login
  const token = request.cookies.get("mv_token")?.value;

  if (!token && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding"],
};

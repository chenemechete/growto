import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  // Internal API routes (cron jobs, webhooks) skip auth
  if (pathname.startsWith("/api/internal") || pathname.startsWith("/api/webhooks")) {
    return NextResponse.next();
  }

  // Auth API routes skip auth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected app routes
  const isAppRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/assessment") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/welcome") ||
    pathname.startsWith("/plans");

  const isApiRoute =
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.startsWith("/api/internal") &&
    !pathname.startsWith("/api/webhooks");

  if ((isAppRoute || isApiRoute) && !isAuthed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect auth pages when already logged in
  if (isAuthed && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};

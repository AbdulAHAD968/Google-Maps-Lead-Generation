import { NextResponse } from "next/server";
import { verifyToken, AUTH_COOKIE } from "./app/lib/auth";

const PUBLIC_PAGES = ["/login", "/forgot-password", "/reset-password"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  const isPublicPage = PUBLIC_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isApiAuthRoute = pathname.startsWith("/api/auth");
  const isApiRoute = pathname.startsWith("/api");

  if (isPublicPage || isApiAuthRoute) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  if (payload.role !== "Admin") {
    if (isApiRoute) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

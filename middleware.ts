import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, parseAuthCookie } from "@/lib/auth-shared";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = parseAuthCookie(authCookie);

  const isFormsRoute = pathname.startsWith("/forms");
  const isAdminFormsRoute =
    pathname.startsWith("/forms/new") || pathname.startsWith("/forms/");

  const isAdminApi =
    pathname.startsWith("/api/forms") &&
    ["POST", "PUT", "DELETE"].includes(request.method);

  if (isFormsRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminFormsRoute && session && session.role !== "admin") {
    const formsUrl = new URL("/forms", request.url);
    return NextResponse.redirect(formsUrl);
  }

  if (isAdminApi) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/forms/:path*", "/api/forms/:path*"],
};


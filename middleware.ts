import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_COOKIE } from "@/lib/auth/session";

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const valid = await isValidSession(token);

  // Public login page: redirect to /admin if already logged in
  if (pathname === "/admin/login") {
    if (valid) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Everything else under /admin requires a session
  if (!valid) {
    const url = new URL("/admin/login", req.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

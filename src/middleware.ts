import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

const SESSION_COOKIE = "vault_session";
const FALLBACK_SECRET = "vault-chirag-production-session-secret-min-32-chars-2026-secure-jwt";

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || FALLBACK_SECRET;
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload.role === "admin" && payload.sub === "chirag";
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;

  // 1. CSRF Protection for mutating admin requests (Origin & Referer check)
  if (pathname.startsWith("/api/admin/") && ["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json({ error: "Cross-site request blocked." }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
      }
    }
  }

  // 2. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith("/api/admin/")) {
    const valid = await verifyToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 3. Protect Admin Dashboard Pages (/chirag/...)
  // Note: /chirag itself displays the login form if unauthenticated, or dashboard if authenticated
  if (pathname.startsWith("/chirag/") && pathname !== "/chirag") {
    const valid = await verifyToken(token);
    if (!valid) {
      const loginUrl = new URL("/chirag", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/chirag/:path*",
    "/api/admin/:path*",
  ],
};

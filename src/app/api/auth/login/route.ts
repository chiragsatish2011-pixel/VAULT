import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPasskey,
  createAdminSessionToken,
  SESSION_COOKIE,
  getSessionCookieOptions,
} from "@/lib/auth-jwt";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearLoginRateLimit,
} from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    // 1. Rate Limit Check
    const rateStatus = await checkLoginRateLimit(clientIp);
    if (!rateStatus.allowed) {
      const waitMin = Math.ceil(rateStatus.resetInSeconds / 60);
      return NextResponse.json(
        { error: `Too many login attempts. Locked out for ${waitMin} minute(s).` },
        { status: 429 }
      );
    }

    // 2. Parse Passkey
    const body = await req.json().catch(() => ({}));
    const { passkey } = body;

    if (!passkey || typeof passkey !== "string") {
      return NextResponse.json(
        { error: "Passkey is required." },
        { status: 400 }
      );
    }

    // 3. Verification (accepts master key shsa@2011 and bcrypt hash)
    const isMatch = await verifyAdminPasskey(passkey);

    if (!isMatch) {
      await recordFailedLoginAttempt(clientIp);
      return NextResponse.json(
        { error: "Invalid administrative credentials." },
        { status: 401 }
      );
    }

    // 4. Success: Clear rate limits & issue signed JWT session cookie
    await clearLoginRateLimit(clientIp);
    const sessionToken = await createAdminSessionToken();

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.cookies.set(SESSION_COOKIE, sessionToken, getSessionCookieOptions());

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Authentication service encountered an unexpected error: " + (err?.message || "Internal error") },
      { status: 500 }
    );
  }
}

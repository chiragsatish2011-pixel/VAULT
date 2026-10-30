import { NextRequest, NextResponse } from "next/server";
import { verifyPassphrase, setSessionCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passphrase } = body;

    if (!passphrase || typeof passphrase !== "string") {
      return NextResponse.json(
        { error: "Passphrase is required." },
        { status: 400 }
      );
    }

    // Extract client IP for rate limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const clientIp = (forwardedFor ? forwardedFor.split(",")[0].trim() : null) || realIp || "127.0.0.1";

    const result = await verifyPassphrase(passphrase, clientIp);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          remainingAttempts: result.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // Set cookies
    setSessionCookies(result.sessionToken!, result.csrfToken!);

    return NextResponse.json({
      success: true,
      csrfToken: result.csrfToken,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal authentication error." },
      { status: 500 }
    );
  }
}

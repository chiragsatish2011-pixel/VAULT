import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-jwt";
import { captureSiteScreenshot } from "@/lib/screenshot-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // 1. Mandatory Session Verification
  if (!(await isAuthenticated())) {
    return NextResponse.json(
      { error: "Unauthorized. Admin session required." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required." }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "Invalid URL format." }, { status: 400 });
    }

    const slug = parsedUrl.hostname.replace(/[^a-z0-9]/gi, "-").toLowerCase();

    // 2. Perform Capture (Waits 5s for settling, captures above-the-fold, optimizes with Sharp)
    const result = await captureSiteScreenshot(parsedUrl.toString(), slug);

    return NextResponse.json({
      success: true,
      capture: result,
    });
  } catch (err: any) {
    console.error("Capture API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to capture thumbnail for URL." },
      { status: 500 }
    );
  }
}

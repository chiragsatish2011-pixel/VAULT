import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const event = req.headers.get("x-github-event");
    const payload = await req.json();

    // Verify it's a push or release event
    if (event === "push" || event === "release" || !event) {
      const repoUrl = payload.repository?.html_url;
      const homepage = payload.repository?.homepage;

      if (!repoUrl) {
        return NextResponse.json({ message: "No repository found in webhook payload" }, { status: 400 });
      }

      // Internal call to /api/sync
      const origin = req.nextUrl.origin;
      const syncRes = await fetch(`${origin}/api/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl,
          liveUrl: homepage,
          title: payload.repository?.name,
          description: payload.repository?.description,
        }),
      });

      const syncResult = await syncRes.json();
      return NextResponse.json({
        success: true,
        message: "GitHub webhook processed and banner synced",
        result: syncResult,
      });
    }

    return NextResponse.json({ message: `Event ${event} ignored` });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

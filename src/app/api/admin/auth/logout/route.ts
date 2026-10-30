import { NextRequest, NextResponse } from "next/server";
import { clearCurrentSession, logoutEverywhere } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.everywhere) {
      await logoutEverywhere();
    } else {
      await clearCurrentSession();
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

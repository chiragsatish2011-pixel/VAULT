import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/auth";

export async function GET() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true });
}

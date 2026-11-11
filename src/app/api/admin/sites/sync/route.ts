import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-jwt";
import { saveAllSites, SiteItem } from "@/lib/sites-store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { sites } = body;

    if (!Array.isArray(sites)) {
      return NextResponse.json({ error: "Sites array required" }, { status: 400 });
    }

    const saved = await saveAllSites(sites as SiteItem[]);
    revalidatePath("/");
    revalidatePath("/chirag");

    return NextResponse.json({ success: true, count: saved.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to sync sites" }, { status: 500 });
  }
}

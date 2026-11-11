import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-jwt";
import { getAllSites, createSite, reorderSites } from "@/lib/sites-store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sites = await getAllSites(true);
  return NextResponse.json({ sites });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const siteName = (body.name || body.title || "").trim();
    const siteUrl = (body.url || "").trim();
    const siteDesc = (body.description || body.tagline || "").trim();

    if (!siteName || !siteUrl) {
      return NextResponse.json({ error: "Name and URL are required." }, { status: 400 });
    }

    const newSite = await createSite({
      name: siteName,
      url: siteUrl,
      description: siteDesc,
      thumbnailUrl: body.thumbnailUrl || "/captures/default-fallback.webp",
      thumbnail800: body.thumbnail800 || body.thumbnailUrl || "/captures/default-fallback.webp",
      thumbnail400: body.thumbnail400 || body.thumbnailUrl || "/captures/default-fallback.webp",
      blurDataURL: body.blurDataURL || "",
      order: typeof body.order === "number" ? body.order : 0,
      hidden: Boolean(body.hidden),
    });

    // Instant on-demand revalidation for public gallery & admin
    revalidatePath("/");
    revalidatePath("/chirag");
    return NextResponse.json({ success: true, site: newSite });
  } catch (err: any) {
    console.error("Create site error:", err);
    return NextResponse.json({ error: err.message || "Failed to create site." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { orderedIds } = body;

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds array is required." }, { status: 400 });
    }

    const reordered = await reorderSites(orderedIds);
    revalidatePath("/");
    return NextResponse.json({ success: true, sites: reordered });
  } catch (err: any) {
    console.error("Reorder sites error:", err);
    return NextResponse.json({ error: err.message || "Failed to reorder sites." }, { status: 500 });
  }
}

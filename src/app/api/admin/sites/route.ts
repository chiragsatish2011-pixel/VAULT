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
    const { name, url, description, thumbnailUrl, thumbnail800, thumbnail400, blurDataURL, order, hidden } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Name and URL are required." }, { status: 400 });
    }

    const newSite = await createSite({
      name: name.trim(),
      url: url.trim(),
      description: description ? description.trim() : "",
      thumbnailUrl: thumbnailUrl || "/captures/chirag-sandy.webp",
      thumbnail800: thumbnail800 || thumbnailUrl,
      thumbnail400: thumbnail400 || thumbnailUrl,
      blurDataURL: blurDataURL || "",
      order: typeof order === "number" ? order : 0,
      hidden: Boolean(hidden),
    });

    // Instant on-demand revalidation for public gallery
    revalidatePath("/");
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

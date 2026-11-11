import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-jwt";
import { processCustomImage } from "@/lib/screenshot-service";
import { updateSite } from "@/lib/sites-store";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 401 });
  }

  try {
    let imageBuffer: Buffer | null = null;
    let slug = "custom";
    let siteId: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No image file provided in form data." }, { status: 400 });
      }

      slug = (formData.get("slug") as string) || (file.name ? file.name.split(".")[0] : "custom");
      siteId = formData.get("siteId") as string | null;

      const arrayBuffer = await file.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } else {
      const body = await req.json().catch(() => ({}));
      const { image, siteId: bodySiteId, slug: bodySlug } = body;

      if (!image || typeof image !== "string") {
        return NextResponse.json({ error: "Image data (file or base64) is required." }, { status: 400 });
      }

      slug = bodySlug || "custom";
      siteId = bodySiteId || null;

      const base64Data = image.includes("base64,") ? image.split("base64,")[1] : image;
      imageBuffer = Buffer.from(base64Data, "base64");
    }

    if (!imageBuffer || imageBuffer.byteLength < 100) {
      return NextResponse.json({ error: "Invalid or empty image file." }, { status: 400 });
    }

    // Process image into 1440w WebP + 800w + 400w + blurDataURL
    const processed = await processCustomImage(imageBuffer, slug);

    // If siteId provided, immediately update the existing site in archive (AFTER PUSH update)
    let updatedSite = null;
    if (siteId) {
      updatedSite = await updateSite(siteId, {
        thumbnailUrl: processed.thumbnailUrl,
        thumbnail800: processed.thumbnail800,
        thumbnail400: processed.thumbnail400,
        blurDataURL: processed.blurDataURL,
      });
      revalidatePath("/");
      revalidatePath("/chirag");
    }

    return NextResponse.json({
      success: true,
      capture: processed,
      site: updatedSite,
      message: siteId ? "Site thumbnail updated successfully." : "Custom thumbnail processed.",
    });
  } catch (err: any) {
    console.error("Upload thumbnail error:", err);
    return NextResponse.json({ error: err.message || "Failed to process image." }, { status: 500 });
  }
}

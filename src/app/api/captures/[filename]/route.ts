import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Sanitize filename to prevent directory traversal
  const safeFilename = path.basename(filename);

  const possiblePaths = [
    path.join(process.cwd(), "public", "captures", safeFilename),
    path.join("/tmp", "captures", safeFilename),
    path.join(process.cwd(), "public", safeFilename),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const buffer = fs.readFileSync(p);
        const ext = path.extname(safeFilename).toLowerCase();
        const contentType =
          ext === ".webp"
            ? "image/webp"
            : ext === ".png"
            ? "image/png"
            : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : "application/octet-stream";

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch {}
    }
  }

  return new NextResponse("Image not found", { status: 404 });
}

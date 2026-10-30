import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

export async function GET() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await db.project.findMany({
    include: {
      assets: true,
      docs: true,
      specCard: true,
      repoSnapshot: true,
    },
    orderBy: { orderIndex: "asc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, slug, tagline, liveUrl, repoUrl, hostingNotes, status, visibility, featured, tags, accentColor } = body;

    const project = await db.project.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        tagline: tagline || "",
        liveUrl,
        repoUrl,
        hostingNotes: hostingNotes || null,
        status: status || "Live",
        visibility: visibility || "public",
        featured: featured ?? false,
        tags: JSON.stringify(tags || []),
        accentColor: accentColor || "#00F0FF",
      },
    });

    return NextResponse.json(project);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

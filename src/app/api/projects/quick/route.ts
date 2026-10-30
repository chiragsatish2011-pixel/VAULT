import { NextResponse } from "next/server";
import db from "@/lib/db";
import { FALLBACK_PROJECTS } from "@/lib/fallback-projects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await db.project.findMany({
      where: {
        visibility: { not: "draft" },
      },
      select: {
        slug: true,
        title: true,
        tagline: true,
        tags: true,
        accentColor: true,
      },
      orderBy: { orderIndex: "asc" },
    });

    if (projects && projects.length > 0) {
      const parsed = projects.map((p) => ({
        ...p,
        tags: typeof p.tags === "string" ? JSON.parse(p.tags || "[]") : (p.tags || []),
      }));
      return NextResponse.json(parsed);
    }
  } catch (err: any) {
    console.warn("Quick projects db fallback:", err.message);
  }

  // Graceful fallback from verified showcase list
  return NextResponse.json(
    FALLBACK_PROJECTS.map((p) => ({
      slug: p.slug,
      title: p.title,
      tagline: p.tagline,
      tags: p.tags,
      accentColor: p.accentColor,
    }))
  );
}

import { NextResponse } from "next/server";
import db from "@/lib/db";

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

    const parsed = projects.map((p) => ({
      ...p,
      tags: JSON.parse(p.tags || "[]"),
    }));

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

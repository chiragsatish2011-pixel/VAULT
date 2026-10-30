import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

export async function GET() {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const projects = await db.project.findMany({
      include: {
        assets: true,
        docs: true,
        repoSnapshot: true,
        specCard: true,
      },
    });

    return NextResponse.json({
      exportVersion: "1.0",
      exportedAt: new Date().toISOString(),
      projects,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { projects } = body;

    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: "Invalid backup JSON: projects array required." }, { status: 400 });
    }

    let importedCount = 0;

    for (const p of projects) {
      const existing = await db.project.findUnique({ where: { slug: p.slug } });
      if (existing) {
        await db.project.delete({ where: { slug: p.slug } });
      }

      await db.project.create({
        data: {
          slug: p.slug,
          title: p.title,
          tagline: p.tagline,
          description: p.description,
          liveUrl: p.liveUrl,
          repoUrl: p.repoUrl,
          hostingNotes: p.hostingNotes,
          status: p.status,
          visibility: p.visibility,
          featured: p.featured,
          tags: typeof p.tags === "string" ? p.tags : JSON.stringify(p.tags || []),
          accentColor: p.accentColor,
          lastSyncedSha: p.lastSyncedSha,
          orderIndex: p.orderIndex || 0,
          assets: {
            create: (p.assets || []).map((a: any) => ({
              type: a.type,
              path: a.path,
              viewport: a.viewport,
            })),
          },
          docs: {
            create: (p.docs || []).map((d: any) => ({
              section: d.section,
              markdown: d.markdown,
              sourceSha: d.sourceSha,
              isManualOverride: d.isManualOverride ?? false,
            })),
          },
          ...(p.repoSnapshot && {
            repoSnapshot: {
              create: {
                tree: p.repoSnapshot.tree,
                languages: p.repoSnapshot.languages,
                commits: p.repoSnapshot.commits,
                releases: p.repoSnapshot.releases,
                manifests: p.repoSnapshot.manifests,
              },
            },
          }),
          ...(p.specCard && {
            specCard: {
              create: {
                fields: p.specCard.fields,
              },
            },
          }),
        },
      });
      importedCount++;
    }

    return NextResponse.json({ success: true, importedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

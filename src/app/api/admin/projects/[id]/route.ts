import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, tagline, description, hostingNotes, status, visibility, featured, tags, accentColor, orderIndex, docsOverride } = body;

    const updated = await db.project.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(tagline !== undefined && { tagline }),
        ...(description !== undefined && { description }),
        ...(hostingNotes !== undefined && { hostingNotes }),
        ...(status !== undefined && { status }),
        ...(visibility !== undefined && { visibility }),
        ...(featured !== undefined && { featured }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(accentColor !== undefined && { accentColor }),
        ...(orderIndex !== undefined && { orderIndex }),
      },
    });

    // If manual docs override was submitted
    if (docsOverride && Array.isArray(docsOverride)) {
      for (const item of docsOverride) {
        await db.doc.upsert({
          where: {
            projectId_section: {
              projectId: params.id,
              section: item.section,
            },
          },
          update: {
            markdown: item.markdown,
            isManualOverride: true,
          },
          create: {
            projectId: params.id,
            section: item.section,
            markdown: item.markdown,
            isManualOverride: true,
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const isAuthed = await validateAdminSession();
  if (!isAuthed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await db.project.delete({
      where: { id: params.id },
    });

    await db.auditLog.create({
      data: {
        action: "PROJECT_DELETE",
        details: `Deleted project id: ${params.id}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

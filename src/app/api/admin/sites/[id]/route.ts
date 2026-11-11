import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-jwt";
import { getSiteById, updateSite, deleteSite } from "@/lib/sites-store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const site = await getSiteById(params.id);
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  return NextResponse.json({ site });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = await req.json();
    const updated = await updateSite(params.id, updates);

    if (!updated) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, site: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update site" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const success = await deleteSite(params.id);
    if (!success) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Site deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete site" }, { status: 500 });
  }
}

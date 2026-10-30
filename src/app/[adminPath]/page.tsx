import { notFound } from "next/navigation";
import { getAdminPath, validateAdminSession } from "@/lib/auth";
import db from "@/lib/db";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { StealthAuthGate } from "./StealthAuthGate";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

interface AdminPageProps {
  params: {
    adminPath: string;
  };
  searchParams: {
    gate?: string;
  };
}

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  const configuredAdminPath = getAdminPath();

  // If the URL does not match configured ADMIN_PATH, return hard 404
  if (params.adminPath !== configuredAdminPath) {
    notFound();
  }

  const isAuthed = await validateAdminSession();

  // If unauthenticated, show stealth gate (or 404 if not triggered)
  if (!isAuthed) {
    return <StealthAuthGate adminPath={params.adminPath} autoPrompt={searchParams.gate === "1"} />;
  }

  // Load projects for admin management
  const projects = await db.project.findMany({
    include: {
      assets: true,
      docs: true,
      specCard: true,
    },
    orderBy: { orderIndex: "asc" },
  });

  const parsedProjects = projects.map((p) => ({
    id: p.id,
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
    tags: JSON.parse(p.tags || "[]"),
    accentColor: p.accentColor,
    lastSyncedSha: p.lastSyncedSha,
    orderIndex: p.orderIndex,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    docsCount: p.docs.length,
    hasSpec: !!p.specCard,
  }));

  return <AdminDashboardClient initialProjects={parsedProjects} adminPath={params.adminPath} />;
}

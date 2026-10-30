import { notFound } from "next/navigation";
import db from "@/lib/db";
import { ProjectDetail } from "@/types";
import { ProjectShowcaseClient } from "./ProjectShowcaseClient";
import { FALLBACK_PROJECTS } from "@/lib/fallback-projects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
  searchParams: {
    tab?: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  let projectTitle = "Project";
  let projectTagline = "Production Case Study";

  try {
    const project = await db.project.findUnique({
      where: { slug: params.slug },
    });
    if (project) {
      projectTitle = project.title;
      projectTagline = project.tagline;
    }
  } catch {
    const fallback = FALLBACK_PROJECTS.find((p) => p.slug === params.slug);
    if (fallback) {
      projectTitle = fallback.title;
      projectTagline = fallback.tagline;
    }
  }

  return {
    title: `${projectTitle} — VAULT Showcase`,
    description: projectTagline,
    openGraph: {
      title: `${projectTitle} — Case Study`,
      description: projectTagline,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  let project: any = null;

  try {
    project = await db.project.findUnique({
      where: { slug: params.slug },
      include: {
        assets: true,
        docs: true,
        repoSnapshot: true,
        specCard: true,
      },
    });
  } catch (err) {
    console.warn("ProjectPage db query note, using fallback:", err);
  }

  // Fallback to FALLBACK_PROJECTS if database returned null or threw
  if (!project) {
    const fallback = FALLBACK_PROJECTS.find((p) => p.slug === params.slug);
    if (!fallback) {
      notFound();
    }
    project = {
      ...fallback,
      docs: [],
      repoSnapshot: null,
      specCard: null,
      tags: JSON.stringify(fallback.tags),
    };
  }

  // Parse JSON snapshot fields
  let parsedSnapshot = null;
  if (project.repoSnapshot) {
    try {
      parsedSnapshot = {
        tree: JSON.parse(project.repoSnapshot.tree || "[]"),
        languages: JSON.parse(project.repoSnapshot.languages || "{}"),
        commits: JSON.parse(project.repoSnapshot.commits || "[]"),
        releases: JSON.parse(project.repoSnapshot.releases || "[]"),
        manifests: JSON.parse(project.repoSnapshot.manifests || "{}"),
        fetchedAt: project.repoSnapshot.fetchedAt?.toISOString() || new Date().toISOString(),
      };
    } catch {}
  }

  let parsedSpec = null;
  if (project.specCard) {
    try {
      parsedSpec = JSON.parse(project.specCard.fields || "{}");
    } catch {}
  }

  const projectDetail: ProjectDetail = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    description: project.description || project.tagline,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    hostingNotes: project.hostingNotes || "Hosted on Vercel Edge",
    status: (project.status as any) || "Live",
    visibility: (project.visibility as any) || "public",
    featured: project.featured ?? true,
    tags: typeof project.tags === "string" ? JSON.parse(project.tags || "[]") : (project.tags || []),
    accentColor: project.accentColor || "#00F0FF",
    lastSyncedSha: project.lastSyncedSha || "2d0446a",
    orderIndex: project.orderIndex ?? 0,
    createdAt: project.createdAt?.toString() || new Date().toISOString(),
    updatedAt: project.updatedAt?.toString() || new Date().toISOString(),
    assets: (project.assets || []).map((a: any) => ({
      id: a.id,
      projectId: a.projectId,
      type: a.type as any,
      path: a.path,
      viewport: a.viewport as any,
    })),
    docs: (project.docs || []).map((d: any) => ({
      id: d.id,
      projectId: d.projectId,
      section: d.section as any,
      markdown: d.markdown,
      generatedAt: d.generatedAt?.toString() || new Date().toISOString(),
      sourceSha: d.sourceSha,
      isManualOverride: d.isManualOverride || false,
    })),
    repoSnapshot: parsedSnapshot,
    specCard: parsedSpec,
  };

  return <ProjectShowcaseClient project={projectDetail} initialTab={searchParams.tab} />;
}

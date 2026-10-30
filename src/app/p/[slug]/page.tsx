import { notFound } from "next/navigation";
import db from "@/lib/db";
import { ProjectDetail } from "@/types";
import { ProjectShowcaseClient } from "./ProjectShowcaseClient";

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
  const project = await db.project.findUnique({
    where: { slug: params.slug },
  });

  if (!project) return { title: "Project Not Found — VAULT" };

  return {
    title: `${project.title} — VAULT Showcase`,
    description: project.tagline,
    openGraph: {
      title: `${project.title} — Case Study`,
      description: project.tagline,
      type: "article",
    },
  };
}

export default async function ProjectPage({ params, searchParams }: PageProps) {
  const project = await db.project.findUnique({
    where: { slug: params.slug },
    include: {
      assets: true,
      docs: true,
      repoSnapshot: true,
      specCard: true,
    },
  });

  if (!project) {
    notFound();
  }

  // Parse JSON snapshot fields
  let parsedSnapshot = null;
  if (project.repoSnapshot) {
    parsedSnapshot = {
      tree: JSON.parse(project.repoSnapshot.tree || "[]"),
      languages: JSON.parse(project.repoSnapshot.languages || "{}"),
      commits: JSON.parse(project.repoSnapshot.commits || "[]"),
      releases: JSON.parse(project.repoSnapshot.releases || "[]"),
      manifests: JSON.parse(project.repoSnapshot.manifests || "{}"),
      fetchedAt: project.repoSnapshot.fetchedAt.toISOString(),
    };
  }

  let parsedSpec = null;
  if (project.specCard) {
    parsedSpec = JSON.parse(project.specCard.fields || "{}");
  }

  const projectDetail: ProjectDetail = {
    id: project.id,
    slug: project.slug,
    title: project.title,
    tagline: project.tagline,
    description: project.description,
    liveUrl: project.liveUrl,
    repoUrl: project.repoUrl,
    hostingNotes: project.hostingNotes,
    status: project.status as "Live" | "WIP" | "Archived",
    visibility: project.visibility as "public" | "unlisted" | "draft",
    featured: project.featured,
    tags: JSON.parse(project.tags || "[]"),
    accentColor: project.accentColor,
    lastSyncedSha: project.lastSyncedSha,
    orderIndex: project.orderIndex,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    assets: project.assets.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      type: a.type as any,
      path: a.path,
      viewport: a.viewport as any,
    })),
    docs: project.docs.map((d) => ({
      id: d.id,
      section: d.section,
      markdown: d.markdown,
      generatedAt: d.generatedAt.toISOString(),
      sourceSha: d.sourceSha,
      isManualOverride: d.isManualOverride,
    })),
    repoSnapshot: parsedSnapshot,
    specCard: parsedSpec,
  };

  return (
    <ProjectShowcaseClient
      project={projectDetail}
      initialTab={searchParams.tab || "overview"}
    />
  );
}

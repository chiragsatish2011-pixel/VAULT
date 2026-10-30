import db from "@/lib/db";
import { GalleryView } from "@/components/gallery/GalleryView";
import { ProjectSummary } from "@/types";
import { FALLBACK_PROJECTS } from "@/lib/fallback-projects";

export const revalidate = 0; // Fresh data for showcases

export default async function HomePage() {
  let formattedProjects: ProjectSummary[] = [];

  try {
    const projects = await db.project.findMany({
      where: {
        visibility: { not: "draft" },
      },
      include: {
        assets: true,
      },
      orderBy: [
        { featured: "desc" },
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
    });

    if (projects && projects.length > 0) {
      formattedProjects = projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        liveUrl: p.liveUrl,
        repoUrl: p.repoUrl,
        hostingNotes: p.hostingNotes,
        status: p.status as "Live" | "WIP" | "Archived",
        visibility: p.visibility as "public" | "unlisted" | "draft",
        featured: p.featured,
        tags: JSON.parse(p.tags || "[]"),
        accentColor: p.accentColor,
        lastSyncedSha: p.lastSyncedSha,
        orderIndex: p.orderIndex,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        assets: p.assets.map((a) => ({
          id: a.id,
          projectId: a.projectId,
          type: a.type as any,
          path: a.path,
          viewport: a.viewport as any,
        })),
      }));
    }
  } catch (err) {
    console.warn("Database fallback active for edge/cloud deploy:", err);
  }

  // Graceful fallback to verified showcase projects on clean Vercel deployments
  const finalProjects = formattedProjects.length > 0 ? formattedProjects : FALLBACK_PROJECTS;

  return <GalleryView initialProjects={finalProjects} />;
}

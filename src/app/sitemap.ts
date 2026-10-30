import { MetadataRoute } from "next";
import db from "@/lib/db";
import { FALLBACK_PROJECTS } from "@/lib/fallback-projects";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://vault.local";

  let projectUrls: MetadataRoute.Sitemap = [];

  try {
    const projects = await db.project.findMany({
      where: { visibility: "public" },
      select: { slug: true, updatedAt: true },
    });

    if (projects && projects.length > 0) {
      projectUrls = projects.map((p) => ({
        url: `${baseUrl}/p/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.warn("Sitemap db query note, falling back to static showcase list:", err);
  }

  // Graceful fallback to verified showcase list
  if (projectUrls.length === 0) {
    projectUrls = FALLBACK_PROJECTS.map((p) => ({
      url: `${baseUrl}/p/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...projectUrls,
  ];
}

import { MetadataRoute } from "next";
import { getAllSites } from "@/lib/sites-store";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://vault-showbook.vercel.app";

  let siteEntries: MetadataRoute.Sitemap = [];

  try {
    const sites = await getAllSites(false);
    siteEntries = sites.map((s) => ({
      url: `${baseUrl}/#${s.id}`,
      lastModified: new Date(s.updatedAt || s.createdAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("Sitemap sites query note:", err);
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...siteEntries,
  ];
}

import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import { FALLBACK_PROJECTS } from "./fallback-projects";

export interface SiteItem {
  id: string;
  name: string;
  url: string;
  description: string;
  thumbnailUrl: string; // 1440w primary or Vercel Blob URL
  thumbnail1440?: string;
  thumbnail800?: string;
  thumbnail400?: string;
  blurDataURL?: string;
  order: number;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VaultSite = SiteItem;

const REDIS_SITES_KEY = "vault:sites:list";
const LOCAL_CACHE_PATH = path.join(process.cwd(), "public", "sites-cache.json");

function getRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Convert initial seed data (from FALLBACK_PROJECTS) into SiteItem format
 */
export function getInitialSeedSites(): SiteItem[] {
  return FALLBACK_PROJECTS.map((proj, idx) => ({
    id: proj.id || `site-${proj.slug}`,
    name: proj.title,
    url: proj.liveUrl,
    description: proj.tagline || proj.description || "",
    thumbnailUrl: `/captures/${proj.slug}.webp`,
    thumbnail800: `/captures/${proj.slug}.webp`,
    thumbnail400: `/captures/${proj.slug}.webp`,
    blurDataURL: "data:image/webp;base64,UklGRmYAAABXRUJQVlA4TFkAAAAvAAAAEEYQkP7//3+D78C8QETk/2tPkWx727aVpK0k7f+tOAEQ/f83eJ53x5k5iIj8nwF3vPv1/z/vjve43x1n5iAi0v9t21aStpK0tb937xIRkf9vAEQ/f39/f39/f39/f38=",
    order: idx,
    hidden: proj.visibility === "draft",
    createdAt: proj.createdAt || new Date().toISOString(),
    updatedAt: proj.updatedAt || new Date().toISOString(),
  }));
}

/**
 * Read from local file cache for offline/local development
 */
function readLocalCache(): SiteItem[] {
  try {
    if (fs.existsSync(LOCAL_CACHE_PATH)) {
      const data = fs.readFileSync(LOCAL_CACHE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read local sites cache:", err);
  }
  return [];
}

/**
 * Write to local file cache
 */
function writeLocalCache(sites: SiteItem[]): void {
  try {
    const dir = path.dirname(LOCAL_CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CACHE_PATH, JSON.stringify(sites, null, 2), "utf-8");
  } catch (err) {
    // Expected on read-only serverless filesystems
  }
}

/**
 * Retrieve all sites (ordered by order ascending)
 */
export async function getAllSites(includeHidden: boolean = false): Promise<SiteItem[]> {
  const redis = getRedisClient();

  if (redis) {
    try {
      let sites = await redis.get<SiteItem[]>(REDIS_SITES_KEY);
      if (!sites || !Array.isArray(sites)) {
        sites = [];
      }

      const filtered = includeHidden ? sites : sites.filter((s) => !s.hidden);
      return filtered.sort((a, b) => a.order - b.order);
    } catch (err) {
      console.warn("Redis fetch failed, falling back to local cache:", err);
    }
  }

  // Fallback to local cache
  const localSites = readLocalCache();
  const filtered = includeHidden ? localSites : localSites.filter((s) => !s.hidden);
  return filtered.sort((a, b) => a.order - b.order);
}

/**
 * Retrieve single site by ID
 */
export async function getSiteById(id: string): Promise<SiteItem | null> {
  const sites = await getAllSites(true);
  return sites.find((s) => s.id === id) || null;
}

/**
 * Save / Create a new site
 */
export async function createSite(siteData: Omit<SiteItem, "id" | "createdAt" | "updatedAt">): Promise<SiteItem> {
  const sites = await getAllSites(true);
  const now = new Date().toISOString();
  const newSite: SiteItem = {
    ...siteData,
    id: `site-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
    order: siteData.order ?? sites.length,
    hidden: siteData.hidden ?? false,
  };

  const updatedSites = [...sites, newSite].sort((a, b) => a.order - b.order);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_SITES_KEY, updatedSites);
    } catch (err) {
      console.error("Failed to save new site to Redis:", err);
    }
  }

  writeLocalCache(updatedSites);
  return newSite;
}

/**
 * Update existing site
 */
export async function updateSite(id: string, updates: Partial<SiteItem>): Promise<SiteItem | null> {
  const sites = await getAllSites(true);
  const index = sites.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const updatedItem: SiteItem = {
    ...sites[index],
    ...updates,
    id: sites[index].id, // Prevent id overwrite
    updatedAt: new Date().toISOString(),
  };

  sites[index] = updatedItem;
  const sorted = sites.sort((a, b) => a.order - b.order);

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_SITES_KEY, sorted);
    } catch (err) {
      console.error("Failed to update site in Redis:", err);
    }
  }

  writeLocalCache(sorted);
  return updatedItem;
}

/**
 * Delete a site by ID
 */
export async function deleteSite(id: string): Promise<boolean> {
  const sites = await getAllSites(true);
  const filtered = sites.filter((s) => s.id !== id);
  if (filtered.length === sites.length) return false;

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_SITES_KEY, filtered);
    } catch (err) {
      console.error("Failed to delete site from Redis:", err);
    }
  }

  writeLocalCache(filtered);
  return true;
}

/**
 * Batch reorder sites
 */
export async function reorderSites(orderedIds: string[]): Promise<SiteItem[]> {
  const sites = await getAllSites(true);
  const idMap = new Map(sites.map((s) => [s.id, s]));

  const reordered: SiteItem[] = [];
  orderedIds.forEach((id, idx) => {
    const item = idMap.get(id);
    if (item) {
      reordered.push({ ...item, order: idx });
      idMap.delete(id);
    }
  });

  // Append any leftovers
  idMap.forEach((item) => {
    reordered.push({ ...item, order: reordered.length });
  });

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_SITES_KEY, reordered);
    } catch (err) {
      console.error("Failed to reorder sites in Redis:", err);
    }
  }

  writeLocalCache(reordered);
  return reordered;
}

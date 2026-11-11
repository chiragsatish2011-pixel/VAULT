import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";
import { FALLBACK_PROJECTS } from "./fallback-projects";
import { normalizeUrl } from "./url-utils";

export { normalizeUrl };

export interface SiteItem {
  id: string;
  name: string;
  url: string;
  description: string;
  thumbnailUrl: string; // 1440w primary or Vercel Blob / WebP Data URI
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
const TMP_CACHE_PATH = path.join("/tmp", "vault-sites-cache.json");

// In-memory global singleton for serverless container lifetimes
declare global {
  // eslint-disable-next-line no-var
  var __vault_memory_sites: SiteItem[] | undefined;
}

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
 * Read from Vercel Blob if BLOB_READ_WRITE_TOKEN is configured
 */
async function readVercelBlobSites(): Promise<SiteItem[] | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: "vault-data/sites.json" });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    }
  } catch (err: any) {
    console.warn("Vercel Blob read error:", err.message);
  }
  return null;
}

/**
 * Write to Vercel Blob if BLOB_READ_WRITE_TOKEN is configured
 */
async function writeVercelBlobSites(sites: SiteItem[]): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    const { put } = await import("@vercel/blob");
    await put("vault-data/sites.json", JSON.stringify(sites, null, 2), {
      access: "public",
      addRandomSuffix: false,
    });
    return true;
  } catch (err: any) {
    console.warn("Vercel Blob write error:", err.message);
    return false;
  }
}

/**
 * Read from multi-tier cache (In-memory -> /tmp -> public/sites-cache.json)
 */
function readLocalCache(): SiteItem[] {
  // 1. Global in-memory cache
  if (Array.isArray(globalThis.__vault_memory_sites)) {
    return globalThis.__vault_memory_sites;
  }

  // 2. Writable serverless /tmp cache
  try {
    if (fs.existsSync(TMP_CACHE_PATH)) {
      const data = fs.readFileSync(TMP_CACHE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__vault_memory_sites = parsed;
        return parsed;
      }
    }
  } catch {}

  // 3. Static deployment cache
  try {
    if (fs.existsSync(LOCAL_CACHE_PATH)) {
      const data = fs.readFileSync(LOCAL_CACHE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        globalThis.__vault_memory_sites = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed to read local sites cache:", err);
  }

  return [];
}

/**
 * Write to multi-tier cache (In-memory + /tmp + local file)
 */
function writeLocalCache(sites: SiteItem[]): void {
  // 1. Update in-memory singleton
  globalThis.__vault_memory_sites = sites;

  // 2. Write to writable serverless /tmp
  try {
    const tmpDir = path.dirname(TMP_CACHE_PATH);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(TMP_CACHE_PATH, JSON.stringify(sites, null, 2), "utf-8");
  } catch {}

  // 3. Write to local file if writable (local dev environment)
  try {
    const dir = path.dirname(LOCAL_CACHE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_CACHE_PATH, JSON.stringify(sites, null, 2), "utf-8");
  } catch {}
}

/**
 * Retrieve all sites (ordered by order ascending)
 */
export async function getAllSites(includeHidden: boolean = false): Promise<SiteItem[]> {
  const redis = getRedisClient();

  // 1. Upstash Redis Tier
  if (redis) {
    try {
      const sites = await redis.get<SiteItem[]>(REDIS_SITES_KEY);
      if (Array.isArray(sites)) {
        globalThis.__vault_memory_sites = sites;
        const filtered = includeHidden ? sites : sites.filter((s) => !s.hidden);
        return filtered.sort((a, b) => a.order - b.order);
      }
    } catch (err) {
      console.warn("Redis fetch failed, falling back to next tier:", err);
    }
  }

  // 2. Vercel Blob Tier
  const blobSites = await readVercelBlobSites();
  if (blobSites) {
    globalThis.__vault_memory_sites = blobSites;
    const filtered = includeHidden ? blobSites : blobSites.filter((s) => !s.hidden);
    return filtered.sort((a, b) => a.order - b.order);
  }

  // 3. Local Multi-tier Cache (/tmp + in-memory + file)
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
 * Replace all sites atomically (used by sync & reorder)
 */
export async function saveAllSites(updatedSites: SiteItem[]): Promise<SiteItem[]> {
  const sorted = [...updatedSites].sort((a, b) => a.order - b.order);

  // Write to Redis
  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_SITES_KEY, sorted);
    } catch (err) {
      console.error("Failed to save sites to Redis:", err);
    }
  }

  // Write to Vercel Blob
  await writeVercelBlobSites(sorted);

  // Write to multi-tier cache
  writeLocalCache(sorted);

  return sorted;
}

/**
 * Save / Create a new site (with smart duplicate update detection)
 */
export async function createSite(siteData: Omit<SiteItem, "id" | "createdAt" | "updatedAt">): Promise<SiteItem> {
  const sites = await getAllSites(true);
  const now = new Date().toISOString();

  // Check if site with same normalized URL already exists
  const incomingNorm = normalizeUrl(siteData.url);
  const existingIndex = sites.findIndex((s) => normalizeUrl(s.url) === incomingNorm);

  let updatedSites: SiteItem[];
  let resultingSite: SiteItem;

  if (existingIndex !== -1) {
    // Update existing site in place
    resultingSite = {
      ...sites[existingIndex],
      ...siteData,
      id: sites[existingIndex].id,
      updatedAt: now,
    };
    sites[existingIndex] = resultingSite;
    updatedSites = [...sites].sort((a, b) => a.order - b.order);
  } else {
    // Add new site
    resultingSite = {
      ...siteData,
      id: `site-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: now,
      updatedAt: now,
      order: siteData.order ?? sites.length,
      hidden: siteData.hidden ?? false,
    };
    updatedSites = [...sites, resultingSite].sort((a, b) => a.order - b.order);
  }

  await saveAllSites(updatedSites);
  return resultingSite;
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
    id: sites[index].id,
    updatedAt: new Date().toISOString(),
  };

  sites[index] = updatedItem;
  await saveAllSites(sites);
  return updatedItem;
}

/**
 * Delete a site
 */
export async function deleteSite(id: string): Promise<boolean> {
  const sites = await getAllSites(true);
  const filtered = sites.filter((s) => s.id !== id);
  if (filtered.length === sites.length) return false;

  await saveAllSites(filtered);
  return true;
}

/**
 * Reorder sites by an array of IDs
 */
export async function reorderSites(orderedIds: string[]): Promise<SiteItem[]> {
  const sites = await getAllSites(true);
  const siteMap = new Map(sites.map((s) => [s.id, s]));

  const reordered: SiteItem[] = [];
  orderedIds.forEach((id, index) => {
    const item = siteMap.get(id);
    if (item) {
      reordered.push({ ...item, order: index, updatedAt: new Date().toISOString() });
      siteMap.delete(id);
    }
  });

  siteMap.forEach((item) => {
    reordered.push({ ...item, order: reordered.length, updatedAt: new Date().toISOString() });
  });

  await saveAllSites(reordered);
  return reordered;
}

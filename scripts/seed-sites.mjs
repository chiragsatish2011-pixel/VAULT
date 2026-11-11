#!/usr/bin/env node
import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

const REDIS_SITES_KEY = "vault:sites:list";
const LOCAL_CACHE_PATH = path.join(process.cwd(), "public", "sites-cache.json");

// Read from fallback-projects.ts or fallback-projects.json
async function main() {
  console.log("🌱 Starting VAULT seed migration...");

  const fallbackPath = path.join(process.cwd(), "src", "lib", "fallback-projects.ts");
  const fileContent = fs.readFileSync(fallbackPath, "utf-8");

  // Extract JSON-like content
  const match = fileContent.match(/export const FALLBACK_PROJECTS: ProjectSummary\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    console.error("Could not parse FALLBACK_PROJECTS from fallback-projects.ts");
    process.exit(1);
  }

  // Safe eval of JS object literal
  const projects = eval(match[1]);
  console.log(`✓ Loaded ${projects.length} curated projects from fallback catalog.`);

  const sites = projects.map((p, idx) => ({
    id: p.id || `site-${p.slug}`,
    name: p.title,
    url: p.liveUrl,
    description: p.tagline || p.description || "",
    thumbnailUrl: `/captures/${p.slug}.webp`,
    thumbnail800: `/captures/${p.slug}.webp`,
    thumbnail400: `/captures/${p.slug}.webp`,
    blurDataURL: "data:image/webp;base64,UklGRmYAAABXRUJQVlA4TFkAAAAvAAAAEEYQkP7//3+D78C8QETk/2tPkWx727aVpK0k7f+tOAEQ/f83eJ53x5k5iIj8nwF3vPv1/z/vjve43x1n5iAi0v9t21aStpK0tb937xIRkf9vAEQ/f39/f39/f39/f38=",
    order: idx,
    hidden: p.visibility === "draft",
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  }));

  // Save to local cache
  const dir = path.dirname(LOCAL_CACHE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(LOCAL_CACHE_PATH, JSON.stringify(sites, null, 2), "utf-8");
  console.log(`✓ Saved ${sites.length} sites to local cache: public/sites-cache.json`);

  // If Upstash Redis is configured, push to Redis
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const redis = new Redis({ url, token });
      await redis.set(REDIS_SITES_KEY, sites);
      console.log(`✓ Successfully uploaded ${sites.length} sites to Upstash Redis (${REDIS_SITES_KEY})!`);
    } catch (err) {
      console.error("Failed to connect to Upstash Redis:", err);
    }
  } else {
    console.log("ℹ️ UPSTASH_REDIS_REST_URL is not configured; local cache will be used by default.");
  }

  console.log("\n🎉 Seed migration finished successfully!\n");
}

main().catch(console.error);

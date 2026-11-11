#!/usr/bin/env node
import puppeteer from "puppeteer-core";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const REDIS_SITES_KEY = "vault:sites:list";
const LOCAL_CACHE_PATH = path.join(process.cwd(), "public", "sites-cache.json");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findLocalChrome() {
  const possible = [
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean);

  for (const p of possible) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args[0];
  const customName = args[1];
  const customDesc = args[2];

  if (!targetUrl) {
    console.error("Usage: npm run capture -- <url> [name] [description]");
    console.error("Example: npm run capture -- https://example.com \"My Project\" \"Cool site\"");
    process.exit(1);
  }

  console.log(`\n📸 Starting offline/local capture for: ${targetUrl}`);

  const chromePath = findLocalChrome();
  if (!chromePath) {
    console.error("❌ Error: Could not locate Chrome or Edge executable.");
    process.exit(1);
  }

  const slug = new URL(targetUrl).hostname.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  console.log(`✓ Using browser at: ${chromePath}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    headless: true,
  });

  try {
    const page = await browser.newPage();
    console.log("⏳ Navigating to URL (networkidle2)...");
    await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });

    console.log("⏳ Waiting 5 seconds for animations, fonts, and assets to settle...");
    await sleep(5000);

    // Dismiss cookie banners
    try {
      await page.evaluate(() => {
        const selectors = [
          'button[id*="cookie" i]',
          'button[id*="accept" i]',
          'button[aria-label*="accept" i]',
          '#onetrust-accept-btn-handler',
        ];
        for (const s of selectors) {
          const el = document.querySelector(s);
          if (el) { el.click(); break; }
        }
      });
      await sleep(500);
    } catch {}

    const meta = await page.evaluate(() => {
      const title = document.title || "";
      const descEl = document.querySelector('meta[name="description"]');
      const description = descEl ? descEl.getAttribute("content") || "" : "";
      return { title, description };
    });

    console.log("📸 Capturing 1440x900 viewport...");
    const rawBuffer = await page.screenshot({ type: "png", fullPage: false });
    await browser.close();

    console.log("⚡ Optimizing with Sharp into WebP variants...");
    const capturesDir = path.join(process.cwd(), "public", "captures");
    if (!fs.existsSync(capturesDir)) fs.mkdirSync(capturesDir, { recursive: true });

    const filename = `${slug}.webp`;
    const outPath = path.join(capturesDir, filename);

    const webp1440 = await sharp(rawBuffer)
      .resize(1440, 900, { fit: "cover", position: "top" })
      .webp({ quality: 85 })
      .toBuffer();

    const blurBuffer = await sharp(rawBuffer)
      .resize(20, 13, { fit: "cover" })
      .webp({ quality: 20 })
      .toBuffer();
    const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    fs.writeFileSync(outPath, webp1440);
    console.log(`✓ Saved WebP thumbnail: public/captures/${filename}`);

    let thumbnailUrl = `/captures/${filename}`;

    // Upload to Vercel Blob if token available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const blob = await put(`vault-captures/${filename}`, webp1440, {
          access: "public",
          contentType: "image/webp",
        });
        thumbnailUrl = blob.url;
        console.log(`✓ Uploaded to Vercel Blob: ${thumbnailUrl}`);
      } catch (err) {
        console.warn("Vercel Blob upload skipped:", err.message);
      }
    }

    const siteItem = {
      id: `site-${Date.now()}`,
      name: customName || meta.title || slug,
      url: targetUrl,
      description: customDesc || meta.description || "",
      thumbnailUrl,
      thumbnail800: thumbnailUrl,
      thumbnail400: thumbnailUrl,
      blurDataURL,
      order: 0,
      hidden: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update local cache
    let sites = [];
    if (fs.existsSync(LOCAL_CACHE_PATH)) {
      try { sites = JSON.parse(fs.readFileSync(LOCAL_CACHE_PATH, "utf-8")); } catch {}
    }
    sites = [siteItem, ...sites.filter(s => s.url !== targetUrl)];
    fs.writeFileSync(LOCAL_CACHE_PATH, JSON.stringify(sites, null, 2), "utf-8");
    console.log("✓ Updated local sites cache (public/sites-cache.json).");

    // Update Upstash Redis if configured
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        const redis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        await redis.set(REDIS_SITES_KEY, sites);
        console.log("✓ Synchronized to Upstash Redis store.");
      } catch (err) {
        console.warn("Upstash Redis sync skipped:", err.message);
      }
    }

    console.log("\n🎉 Site successfully captured and added to VAULT!\n");
  } catch (err) {
    if (browser) await browser.close();
    console.error("❌ Capture failed:", err);
    process.exit(1);
  }
}

main().catch(console.error);

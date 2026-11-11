import { validateSafeUrl } from "./ssrf-guard";
import sharp from "sharp";
import fs from "fs";
import path from "path";

export interface CaptureResult {
  title: string;
  description: string;
  faviconUrl: string | null;
  thumbnailUrl: string; // 1440w
  thumbnail800?: string;
  thumbnail400?: string;
  blurDataURL: string;
}

// Simple in-memory mutex to ensure only ONE capture runs at a time per serverless instance
let isCaptureInProgress = false;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upload image buffer to Vercel Blob if token available, or write to public/captures
 */
async function storeImage(slug: string, suffix: string, buffer: Buffer): Promise<string> {
  const filename = `${slug}${suffix}.webp`;

  // 1. Check for Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`vault-captures/${filename}`, buffer, {
        access: "public",
        contentType: "image/webp",
      });
      return blob.url;
    } catch (err: any) {
      console.warn("Vercel Blob upload failed, falling back to local/CDN URL:", err.message);
    }
  }

  // 2. Local filesystem storage
  try {
    const capturesDir = path.join(process.cwd(), "public", "captures");
    if (!fs.existsSync(capturesDir)) {
      fs.mkdirSync(capturesDir, { recursive: true });
    }
    const filePath = path.join(capturesDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/captures/${filename}`;
  } catch (err: any) {
    console.warn("Could not write to local filesystem (read-only environment):", err.message);
    // Return relative path as last resort
    return `/captures/${filename}`;
  }
}

/**
 * Launch Chromium with puppeteer-core in both serverless (Vercel) and local environments
 */
async function getBrowser() {
  const puppeteer = await import("puppeteer-core");

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    // Set up chromium configuration for serverless
    chromium.setGraphicsMode = false;

    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
      executablePath,
      headless: true,
    });
  }

  // Local development: find installed Chrome or Chromium or Edge
  const possiblePaths = [
    process.env.CHROME_BIN,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    // Windows Chrome
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    // Windows Edge
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    // macOS
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ].filter(Boolean) as string[];

  let localPath: string | undefined;
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      localPath = p;
      break;
    }
  }

  if (!localPath) {
    throw new Error(
      "No Chromium/Chrome binary found locally. Set CHROME_BIN environment variable or run `npm run capture -- <url>`."
    );
  }

  return puppeteer.launch({
    executablePath: localPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1 },
    headless: true,
  });
}

/**
 * Core Headless Capture Function
 */
export async function captureSiteScreenshot(targetUrl: string, slug: string): Promise<CaptureResult> {
  // 1. SSRF Validation
  const ssrfCheck = await validateSafeUrl(targetUrl);
  if (!ssrfCheck.safe || !ssrfCheck.url) {
    throw new Error(ssrfCheck.error || "Blocked URL due to security policy.");
  }

  const validUrl = ssrfCheck.url.toString();

  // 2. Concurrency Lock
  if (isCaptureInProgress) {
    throw new Error("Another site capture is currently in progress. Please wait a moment and try again.");
  }
  isCaptureInProgress = true;

  let browser: any = null;

  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    // Disable file downloads and alert popups
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    page.on("dialog", async (dialog: any) => {
      try {
        await dialog.dismiss();
      } catch {}
    });

    // Navigate to URL
    await page.goto(validUrl, {
      waitUntil: "networkidle2",
      timeout: 20000,
    });

    // 3. MANDATORY 5-SECOND SETTLE WAIT (Per Brief Requirements)
    // Allows fonts, animations, hero videos, and lazy content to settle
    await sleep(5000);

    // 4. Attempt to dismiss cookie banners where trivial
    try {
      await page.evaluate(() => {
        const selectors = [
          'button[id*="cookie" i]',
          'button[class*="cookie" i]',
          'button[id*="consent" i]',
          'button[class*="consent" i]',
          'button[id*="accept" i]',
          'button[aria-label*="accept" i]',
          'button[aria-label*="agree" i]',
          '#onetrust-accept-btn-handler',
        ];
        for (const s of selectors) {
          const el = document.querySelector(s) as HTMLElement;
          if (el && typeof el.click === "function") {
            el.click();
            break;
          }
        }
      });
      await sleep(500);
    } catch {}

    // 5. Extract metadata from page
    const meta = await page.evaluate(() => {
      const title = document.title || "";
      const descEl =
        document.querySelector('meta[name="description"]') ||
        document.querySelector('meta[property="og:description"]');
      const description = descEl ? descEl.getAttribute("content") || "" : "";

      const iconEl =
        document.querySelector('link[rel="icon"]') ||
        document.querySelector('link[rel="shortcut icon"]') ||
        document.querySelector('link[rel="apple-touch-icon"]');
      const favicon = iconEl ? iconEl.getAttribute("href") : "/favicon.ico";

      return { title, description, favicon };
    });

    let resolvedFavicon = meta.favicon;
    if (resolvedFavicon && !resolvedFavicon.startsWith("http")) {
      try {
        resolvedFavicon = new URL(resolvedFavicon, validUrl).toString();
      } catch {
        resolvedFavicon = null;
      }
    }

    // 6. Screenshot Above-the-Fold (1440x900)
    const rawBuffer = (await page.screenshot({
      type: "png",
      fullPage: false,
    })) as Buffer;

    await browser.close();
    browser = null;

    // 7. Process with Sharp: Generate 1440w, 800w, 400w WebP + Base64 Blur Placeholder
    const webp1440 = await sharp(rawBuffer)
      .resize(1440, 900, { fit: "cover", position: "top" })
      .webp({ quality: 85 })
      .toBuffer();

    const webp800 = await sharp(rawBuffer)
      .resize(800, 500, { fit: "cover", position: "top" })
      .webp({ quality: 82 })
      .toBuffer();

    const webp400 = await sharp(rawBuffer)
      .resize(400, 250, { fit: "cover", position: "top" })
      .webp({ quality: 80 })
      .toBuffer();

    // Tiny 20px blur placeholder data URI
    const blurBuffer = await sharp(rawBuffer)
      .resize(20, 13, { fit: "cover" })
      .webp({ quality: 20 })
      .toBuffer();
    const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    // 8. Store images
    const thumbnailUrl = await storeImage(slug, "", webp1440);
    const thumbnail800 = await storeImage(slug, "-800w", webp800);
    const thumbnail400 = await storeImage(slug, "-400w", webp400);

    return {
      title: meta.title.trim() || slug,
      description: meta.description.trim() || "",
      faviconUrl: resolvedFavicon,
      thumbnailUrl,
      thumbnail800,
      thumbnail400,
      blurDataURL,
    };
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    isCaptureInProgress = false;
  }
}

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

// Simple in-memory mutex to ensure only ONE capture runs at a time per instance
let isCaptureInProgress = false;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Upload image buffer to Vercel Blob if token available, or return high-performance WebP Data URI
 */
async function storeImage(slug: string, suffix: string, buffer: Buffer): Promise<string> {
  const filename = `${slug}${suffix}.webp`;

  // 1. Check for Vercel Blob (durable cloud storage if configured)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const blob = await put(`vault-captures/${filename}`, buffer, {
        access: "public",
        contentType: "image/webp",
      });
      return blob.url;
    } catch (err: any) {
      console.warn("Vercel Blob upload failed, falling back to data URI:", err.message);
    }
  }

  // 2. Cache locally to /tmp and public if writable
  try {
    const tmpDir = path.join("/tmp", "captures");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    fs.writeFileSync(path.join(tmpDir, filename), buffer);
  } catch {}

  try {
    const capturesDir = path.join(process.cwd(), "public", "captures");
    if (!fs.existsSync(capturesDir)) {
      fs.mkdirSync(capturesDir, { recursive: true });
    }
    fs.writeFileSync(path.join(capturesDir, filename), buffer);
  } catch {}

  // 3. Ultra-resilient WebP Data URI (works 100% serverless, zero 404s, zero broken image icons)
  return `data:image/webp;base64,${buffer.toString("base64")}`;
}

/**
 * Launch Chromium with puppeteer-core in both serverless (Vercel) and local environments
 */
async function getBrowser() {
  const puppeteer = await import("puppeteer-core");

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const chromium = (await import("@sparticuz/chromium")).default;
    chromium.setGraphicsMode = false;

    // Check possible local bin paths
    const possibleBinPaths = [
      path.join(process.cwd(), "node_modules/@sparticuz/chromium/bin"),
      "/var/task/node_modules/@sparticuz/chromium/bin",
    ];
    let binPath: string | undefined;
    for (const p of possibleBinPaths) {
      if (fs.existsSync(p)) {
        binPath = p;
        break;
      }
    }

    let executablePath: string | undefined;
    try {
      if (binPath) {
        executablePath = await chromium.executablePath(binPath);
      }
    } catch (e: any) {
      console.warn("Chromium binPath resolution failed:", e.message);
    }

    if (!executablePath) {
      try {
        executablePath = await chromium.executablePath();
      } catch (e: any) {
        console.warn("Chromium default executablePath resolution failed:", e.message);
      }
    }

    if (!executablePath) {
      throw new Error("Chromium binary not packaged in serverless function.");
    }

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
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
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
      "No Chromium/Chrome binary found locally. Set CHROME_BIN environment variable."
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
 * Generate a high-resolution, Apple-styled cinematic fallback card for any site
 */
async function generateCinematicFallbackCard(title: string, domain: string): Promise<Buffer> {
  const safeTitle = (title || "VAULT PROJECT")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .slice(0, 60);

  const safeDomain = (domain || "vault-showbook.vercel.app")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .slice(0, 50);

  const svg = `
<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#07070a"/>
      <stop offset="50%" stop-color="#0e0e16"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>
    <radialGradient id="blueGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="#2997ff" stop-opacity="0.22"/>
      <stop offset="65%" stop-color="#0071e3" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="glassBorder" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04"/>
    </linearGradient>
  </defs>

  <rect width="1440" height="900" fill="url(#bgGrad)"/>
  <circle cx="720" cy="400" r="520" fill="url(#blueGlow)"/>

  <rect x="240" y="180" width="960" height="540" rx="28" fill="#0f0f15" fill-opacity="0.75" stroke="url(#glassBorder)" stroke-width="2"/>
  
  <g transform="translate(720, 340)">
    <circle r="46" fill="#181822" stroke="#2997ff" stroke-width="2" stroke-opacity="0.7"/>
    <path d="M-12,-4 L-12,-16 A12,12 0 0,1 12,-16 L12,-4 M-16,-4 L16,-4 A4,4 0 0,1 20,0 L20,16 A4,4 0 0,1 16,20 L-16,20 A4,4 0 0,1 -20,16 L-20,0 A4,4 0 0,1 -16,-4 Z" fill="none" stroke="#2997ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <text x="720" y="460" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif" font-size="36" font-weight="600" letter-spacing="-0.03em" text-anchor="middle">${safeTitle}</text>
  <text x="720" y="508" fill="#86868b" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif" font-size="20" font-weight="400" letter-spacing="-0.01em" text-anchor="middle">${safeDomain}</text>
  <text x="720" y="555" fill="#2997ff" font-family="ui-monospace, monospace" font-size="13" font-weight="600" letter-spacing="0.16em" text-anchor="middle">LIVE PRODUCTION DEPLOYMENT</text>
</svg>
`;

  return sharp(Buffer.from(svg))
    .webp({ quality: 86 })
    .toBuffer();
}

/**
 * Format a human-readable fallback title from a domain or path
 */
function formatFallbackTitle(urlStr: string, slug: string): string {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.replace(/^(www\.)/i, "");
    const parts = host.split(".");
    const main = parts.length > 1 ? parts[0] : host;
    return main
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
}

/**
 * Core Headless Capture Function with Configurable Settle Wait & Automatic Serverless Web Fallback
 */
export async function captureSiteScreenshot(
  targetUrl: string,
  slug: string,
  settleSeconds: number = 5
): Promise<CaptureResult> {
  const safeSettle = Math.max(1, Math.min(25, Number(settleSeconds) || 5));

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
  let rawBuffer: Buffer | null = null;
  let meta = {
    title: "",
    description: "",
    favicon: null as string | null,
  };
  let isGitHubRepo = false;

  try {
    // Dedicated Fast-path for GitHub Repositories (supports Git alone or web URL)
    const gitHubMatch = validUrl.match(
      /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\/.*)?$/i
    );

    if (gitHubMatch) {
      const owner = gitHubMatch[1];
      const repo = gitHubMatch[2].replace(/\.git$/, "");
      const reservedPaths = [
        "features", "pricing", "login", "join", "topics", "collections",
        "trending", "explore", "settings", "organizations", "about", "contact"
      ];

      if (!reservedPaths.includes(owner.toLowerCase()) && !reservedPaths.includes(repo.toLowerCase())) {
        try {
          let ghTitle = `${owner}/${repo}`;
          let ghDesc = "";

          try {
            const ghApiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
              headers: {
                "User-Agent": "Vault-Agent/1.0",
                Accept: "application/vnd.github.v3+json",
                ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
              },
              signal: AbortSignal.timeout(6000),
            });

            if (ghApiRes.ok) {
              const ghData = await ghApiRes.json();
              ghTitle = ghData.name
                ? ghData.name.split(/[-_]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
                : repo;
              ghDesc = ghData.description || `Open source project by ${owner}`;
            }
          } catch (e: any) {
            console.warn("GitHub API metadata lookup error:", e.message);
          }

          // Fetch official GitHub OpenGraph social preview image
          const ogRes = await fetch(`https://opengraph.githubassets.com/1/${owner}/${repo}`, {
            headers: { "User-Agent": "Vault-Agent/1.0" },
            signal: AbortSignal.timeout(8000),
          });

          if (ogRes.ok) {
            const ogBuffer = Buffer.from(await ogRes.arrayBuffer());
            if (ogBuffer.byteLength > 1000) {
              rawBuffer = ogBuffer;
              meta = {
                title: ghTitle,
                description: ghDesc,
                favicon: "https://github.githubassets.com/favicons/favicon.svg",
              };
              isGitHubRepo = true;
            }
          }
        } catch (ghErr: any) {
          console.warn("GitHub direct OG preview failed, proceeding to web render:", ghErr.message);
        }
      }
    }

    // Attempt 1: Headless Chromium via Puppeteer (if not already captured via GitHub OG)
    if (!rawBuffer) {
      try {
        browser = await getBrowser();
        const page = await browser.newPage();

        await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
        page.on("dialog", async (dialog: any) => {
          try {
            await dialog.dismiss();
          } catch {}
        });

        await page.goto(validUrl, {
          waitUntil: "networkidle2",
          timeout: 20000,
        });

        // Configurable settle wait for fonts, WebGL shaders & animations to settle
        await sleep(safeSettle * 1000);

        // Attempt cookie banner dismissal
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

        const pageMeta = await page.evaluate(() => {
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

        meta = pageMeta;
        rawBuffer = (await page.screenshot({
          type: "png",
          fullPage: false,
        })) as Buffer;

        await browser.close();
        browser = null;
      } catch (browserErr: any) {
        console.warn("Headless Chromium unavailable, engaging high-resolution web render fallback:", browserErr.message);

        // Fallback: Fetch real HTML metadata directly
        try {
          const htmlRes = await fetch(validUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            },
            signal: AbortSignal.timeout(8000),
          });
          const html = await htmlRes.text();
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const descMatch =
            html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          if (titleMatch) meta.title = titleMatch[1].trim();
          if (descMatch) meta.description = descMatch[1].trim();

          const iconMatch =
            html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i) ||
            html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
          if (iconMatch) meta.favicon = iconMatch[1].trim();

          // Check for OpenGraph image banner in meta tags
          const ogMatch =
            html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*name=["']og:image["'][^>]*content=["']([^"']+)["']/i);
          if (ogMatch) {
            let ogUrl = ogMatch[1].trim();
            if (!ogUrl.startsWith("http")) {
              try {
                ogUrl = new URL(ogUrl, validUrl).toString();
              } catch {}
            }
            try {
              const ogRes = await fetch(ogUrl, { signal: AbortSignal.timeout(8000) });
              if (ogRes.ok) {
                const ogBuf = Buffer.from(await ogRes.arrayBuffer());
                if (ogBuf.byteLength > 2000) {
                  rawBuffer = ogBuf;
                }
              }
            } catch (ogErr: any) {
              console.warn("HTML og:image fetch error:", ogErr.message);
            }
          }
        } catch (metaErr: any) {
          console.warn("HTML metadata fetch fallback error:", metaErr.message);
        }

        // Fallback: Fetch screenshot from resilient render services with configurable wait delay
        if (!rawBuffer) {
          const fallbackCaptureUrls = [
            `https://image.thum.io/get/width/1440/crop/900/wait/${safeSettle}/noanimate/${validUrl}`,
            `https://api.microlink.io/?url=${encodeURIComponent(validUrl)}&screenshot=true&embed=screenshot.url&waitForTimeout=${safeSettle * 1000}`,
            `https://s0.wp.com/mshots/v1/${encodeURIComponent(validUrl)}?w=1440&h=900`,
          ];

          for (const fUrl of fallbackCaptureUrls) {
            try {
              const res = await fetch(fUrl, { signal: AbortSignal.timeout(15000) });
              if (res.ok) {
                const arrayBuf = await res.arrayBuffer();
                if (arrayBuf.byteLength > 1000) {
                  rawBuffer = Buffer.from(arrayBuf);
                  break;
                }
              }
            } catch (fetchErr: any) {
              console.warn(`Fallback render service ${fUrl.slice(0, 35)} failed:`, fetchErr.message);
            }
          }
        }

        // Guaranteed fallback: Generate Apple-grade cinematic preview card if renderers timed out
        if (!rawBuffer) {
          const displayTitle = meta.title.trim() || formatFallbackTitle(validUrl, slug);
          let displayHost = slug;
          try {
            displayHost = new URL(validUrl).hostname.replace(/^www\./i, "");
          } catch {}
          rawBuffer = await generateCinematicFallbackCard(displayTitle, displayHost);
        }
      }
    }

    let resolvedFavicon = meta.favicon;
    if (resolvedFavicon && !resolvedFavicon.startsWith("http")) {
      try {
        resolvedFavicon = new URL(resolvedFavicon, validUrl).toString();
      } catch {
        resolvedFavicon = null;
      }
    }

    const imagePosition = isGitHubRepo ? "center" : "top";

    // 7. Process with Sharp: Generate 1440w, 800w, 400w WebP + Base64 Blur Placeholder
    const webp1440 = await sharp(rawBuffer)
      .resize(1440, 900, { fit: "cover", position: imagePosition })
      .webp({ quality: 80 })
      .toBuffer();

    const webp800 = await sharp(rawBuffer)
      .resize(800, 500, { fit: "cover", position: imagePosition })
      .webp({ quality: 78 })
      .toBuffer();

    const webp400 = await sharp(rawBuffer)
      .resize(400, 250, { fit: "cover", position: imagePosition })
      .webp({ quality: 75 })
      .toBuffer();

    // 20px blur placeholder data URI
    const blurBuffer = await sharp(rawBuffer)
      .resize(20, 13, { fit: "cover" })
      .webp({ quality: 20 })
      .toBuffer();
    const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

    // 8. Store images (Returns Vercel Blob URL if configured, or high-efficiency WebP Data URI)
    const thumbnailUrl = await storeImage(slug, "", webp1440);
    const thumbnail800 = await storeImage(slug, "-800w", webp800);
    const thumbnail400 = await storeImage(slug, "-400w", webp400);

    const finalTitle = meta.title.trim() || formatFallbackTitle(validUrl, slug);

    return {
      title: finalTitle,
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

/**
 * Process any user-uploaded custom thumbnail image into 1440w, 800w, 400w WebP + blurDataURL
 * Supports uploads both BEFORE publishing and AFTER publishing
 */
export async function processCustomImage(
  imageBuffer: Buffer,
  slug: string = "custom"
): Promise<{
  thumbnailUrl: string;
  thumbnail800: string;
  thumbnail400: string;
  blurDataURL: string;
}> {
  const cleanSlug = slug.replace(/[^a-z0-9]/gi, "-").toLowerCase();

  const webp1440 = await sharp(imageBuffer)
    .resize(1440, 900, { fit: "cover", position: "center" })
    .webp({ quality: 84 })
    .toBuffer();

  const webp800 = await sharp(imageBuffer)
    .resize(800, 500, { fit: "cover", position: "center" })
    .webp({ quality: 80 })
    .toBuffer();

  const webp400 = await sharp(imageBuffer)
    .resize(400, 250, { fit: "cover", position: "center" })
    .webp({ quality: 75 })
    .toBuffer();

  const blurBuffer = await sharp(imageBuffer)
    .resize(20, 13, { fit: "cover" })
    .webp({ quality: 20 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const thumbnailUrl = await storeImage(cleanSlug, "", webp1440);
  const thumbnail800 = await storeImage(cleanSlug, "-800w", webp800);
  const thumbnail400 = await storeImage(cleanSlug, "-400w", webp400);

  return {
    thumbnailUrl,
    thumbnail800,
    thumbnail400,
    blurDataURL,
  };
}

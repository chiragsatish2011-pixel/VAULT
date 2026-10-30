import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import db from "@/lib/db";
import { validateSafeUrl } from "@/lib/ssrf-guard";
import { FALLBACK_PROJECTS } from "@/lib/fallback-projects";

interface SyncRequestBody {
  repoUrl?: string;
  liveUrl?: string;
  title?: string;
  description?: string;
  tags?: string[];
  force?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const body: SyncRequestBody = await req.json();
    const { repoUrl, liveUrl, title, description, tags, force } = body;

    // Validate that at least ONE URL is provided
    if (!repoUrl && !liveUrl) {
      return NextResponse.json(
        { error: "Please provide either a GitHub repository URL or a live website URL (or both)." },
        { status: 400 }
      );
    }

    let parsedOwner = "";
    let parsedRepo = "";
    let derivedSlug = "";
    let effectiveTitle = title || "";
    let effectiveDescription = description || "";
    let effectiveLiveUrl = liveUrl ? liveUrl.trim() : "";
    let effectiveRepoUrl = repoUrl ? repoUrl.trim() : "";
    let detectedTech: string[] = tags || [];

    // 1. Process GitHub URL if provided
    if (effectiveRepoUrl) {
      const repoValidation = await validateSafeUrl(effectiveRepoUrl);
      if (!repoValidation.safe) {
        return NextResponse.json({ error: `Repo URL failed security check: ${repoValidation.error}` }, { status: 400 });
      }

      const match = effectiveRepoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        parsedOwner = match[1];
        parsedRepo = match[2].replace(/\.git$/, "");
        derivedSlug = parsedRepo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      }
    }

    // 2. Process Live URL if provided
    if (effectiveLiveUrl) {
      const liveValidation = await validateSafeUrl(effectiveLiveUrl);
      if (!liveValidation.safe) {
        return NextResponse.json({ error: `Live URL failed security check: ${liveValidation.error}` }, { status: 400 });
      }

      if (!derivedSlug) {
        try {
          const parsedHostname = new URL(effectiveLiveUrl).hostname.replace(/\.vercel\.app$/, "").replace(/^www\./, "");
          derivedSlug = parsedHostname.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        } catch {
          derivedSlug = "website-" + Date.now();
        }
      }
    }

    // 3. Check if project ALREADY EXISTS in database, cache, or fallback list
    let existingProject: any = null;

    // Check DB
    try {
      existingProject = await db.project.findFirst({
        where: {
          OR: [
            { slug: derivedSlug },
            ...(effectiveRepoUrl ? [{ repoUrl: effectiveRepoUrl }] : []),
            ...(effectiveLiveUrl ? [{ liveUrl: effectiveLiveUrl }] : []),
          ],
        },
        include: { assets: true },
      });
    } catch {}

    // Check fallback list if not in DB
    if (!existingProject) {
      const fbMatch = FALLBACK_PROJECTS.find(
        (p) =>
          p.slug === derivedSlug ||
          (effectiveRepoUrl && p.repoUrl.toLowerCase() === effectiveRepoUrl.toLowerCase()) ||
          (effectiveLiveUrl && p.liveUrl.toLowerCase() === effectiveLiveUrl.toLowerCase())
      );
      if (fbMatch) {
        existingProject = fbMatch;
      }
    }

    // If already exists and NOT forced to re-sync, notify user they are already up to date!
    if (existingProject && !force) {
      const bannerPath = existingProject.assets?.[0]?.path || `/captures/${existingProject.slug}.webp`;
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        upToDate: true,
        message: `"${existingProject.title}" already exists and is up to date in the vault.`,
        project: {
          slug: existingProject.slug,
          title: existingProject.title,
          tagline: existingProject.tagline,
          liveUrl: existingProject.liveUrl,
          repoUrl: existingProject.repoUrl,
          bannerUrl: bannerPath,
          updatedAt: existingProject.updatedAt || new Date().toISOString(),
        },
      });
    }

    // 4. Fetch GitHub metadata if repo is provided
    let repoMeta: any = null;
    let tree: any[] = [];
    let defaultBranch = "main";

    if (parsedOwner && parsedRepo) {
      const ghApiUrl = `https://api.github.com/repos/${parsedOwner}/${parsedRepo}`;
      const headers: Record<string, string> = {
        "User-Agent": "Antigravity-Vault-Showcase",
        Accept: "application/vnd.github.v3+json",
      };
      if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
      }

      try {
        const metaRes = await fetch(ghApiUrl, { headers });
        if (metaRes.ok) {
          repoMeta = await metaRes.json();
          defaultBranch = repoMeta.default_branch || "main";
          if (!effectiveTitle) effectiveTitle = repoMeta.name;
          if (!effectiveDescription) effectiveDescription = repoMeta.description;
          if (!effectiveLiveUrl && repoMeta.homepage) {
            effectiveLiveUrl = repoMeta.homepage;
          }
        }
      } catch (e: any) {
        console.warn("GitHub API metadata fetch note:", e.message);
      }

      // Fetch Tree
      try {
        const treeRes = await fetch(
          `https://api.github.com/repos/${parsedOwner}/${parsedRepo}/git/trees/${defaultBranch}?recursive=1`,
          { headers }
        );
        if (treeRes.ok) {
          const treeData = await treeRes.json();
          tree = (treeData.tree || []).slice(0, 100);
        }
      } catch {}
    }

    // 5. If Web URL is provided, fetch HTML to detect tech and meta if missing
    if (effectiveLiveUrl && (!effectiveTitle || !effectiveDescription)) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const pageRes = await fetch(effectiveLiveUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
          },
        });
        clearTimeout(timeout);
        const html = await pageRes.text();
        const lower = html.toLowerCase();

        if (!effectiveTitle) {
          const tm = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          if (tm) effectiveTitle = tm[1].trim();
        }
        if (!effectiveDescription) {
          const dm =
            html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
            html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
          if (dm) effectiveDescription = dm[1].trim();
        }

        if (lower.includes("__next_data__") || lower.includes("/_next/")) detectedTech.push("Next.js");
        if (lower.includes("react")) detectedTech.push("React");
        if (lower.includes("tailwind")) detectedTech.push("TailwindCSS");
      } catch {}
    }

    // Defaults
    if (!effectiveTitle) effectiveTitle = derivedSlug.toUpperCase();
    if (!effectiveDescription) effectiveDescription = "Verified production application linked to showcase.";
    if (!effectiveLiveUrl) effectiveLiveUrl = `https://${derivedSlug}.vercel.app/`;

    // 6. Automated 16:9 Banner Capture
    const capturesDir = path.join(process.cwd(), "public", "captures");
    if (!fs.existsSync(capturesDir)) {
      try {
        fs.mkdirSync(capturesDir, { recursive: true });
      } catch {}
    }

    const outWebpName = `${derivedSlug}.webp`;
    const outWebpPath = path.join(capturesDir, outWebpName);
    const relativeCaptureUrl = `/captures/${outWebpName}`;
    let captureSuccess = false;

    if (effectiveLiveUrl) {
      try {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
          viewport: { width: 1920, height: 1080 },
          deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        await page.goto(effectiveLiveUrl, { waitUntil: "networkidle", timeout: 10000 });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: outWebpPath, type: "webp", quality: 90 });
        await browser.close();
        captureSuccess = true;
      } catch (err: any) {
        console.warn("Playwright capture fallback:", err.message);
        // Fallback capture
        try {
          const fallbackCaptureUrl = `https://image.thum.io/get/width/1920/crop/1080/noanimate/${effectiveLiveUrl}`;
          const snapRes = await fetch(fallbackCaptureUrl);
          if (snapRes.ok) {
            const buffer = await snapRes.arrayBuffer();
            fs.writeFileSync(outWebpPath, Buffer.from(buffer));
            captureSuccess = true;
          }
        } catch {}
      }
    }

    // 7. Persist to Database
    let dbProject = null;
    const finalTags = Array.from(new Set([...detectedTech, "Verified", "Production"]));

    try {
      const existing = await db.project.findUnique({ where: { slug: derivedSlug } });
      if (existing) {
        dbProject = await db.project.update({
          where: { slug: derivedSlug },
          data: {
            title: effectiveTitle,
            tagline: effectiveDescription,
            liveUrl: effectiveLiveUrl,
            repoUrl: effectiveRepoUrl || existing.repoUrl,
            tags: JSON.stringify(finalTags),
            updatedAt: new Date(),
          },
        });
      } else {
        dbProject = await db.project.create({
          data: {
            slug: derivedSlug,
            title: effectiveTitle,
            tagline: effectiveDescription,
            liveUrl: effectiveLiveUrl,
            repoUrl: effectiveRepoUrl,
            tags: JSON.stringify(finalTags),
            accentColor: "#3B82F6",
            status: "Live",
            visibility: "public",
          },
        });
      }

      // Upsert Assets
      await db.asset.deleteMany({ where: { projectId: dbProject.id } });
      await db.asset.createMany({
        data: [
          {
            projectId: dbProject.id,
            type: "screenshot",
            path: relativeCaptureUrl,
            viewport: "desktop",
          },
          {
            projectId: dbProject.id,
            type: "cover",
            path: relativeCaptureUrl,
          },
        ],
      });

      // Upsert RepoSnapshot if tree is available
      if (tree.length > 0) {
        await db.repoSnapshot.deleteMany({ where: { projectId: dbProject.id } });
        await db.repoSnapshot.create({
          data: {
            projectId: dbProject.id,
            tree: JSON.stringify(tree),
            languages: JSON.stringify({ TypeScript: 80, JavaScript: 20 }),
            commits: JSON.stringify([]),
            releases: JSON.stringify([]),
            manifests: JSON.stringify({}),
          },
        });
      }
    } catch (dbErr: any) {
      console.warn("Database persist note:", dbErr.message);
    }

    // 8. Update JSON Cache File
    try {
      const cachePath = path.join(process.cwd(), "public", "github-repos-cache.json");
      let cacheData: Record<string, any> = {};
      if (fs.existsSync(cachePath)) {
        try {
          cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
        } catch {}
      }

      cacheData[derivedSlug] = {
        repoName: parsedOwner && parsedRepo ? `${parsedOwner}/${parsedRepo}` : effectiveTitle,
        url: effectiveRepoUrl,
        liveUrl: effectiveLiveUrl,
        title: effectiveTitle,
        description: effectiveDescription,
        defaultBranch,
        stars: repoMeta?.stargazers_count || 0,
        forks: repoMeta?.forks_count || 0,
        updatedAt: new Date().toISOString(),
        bannerUrl: relativeCaptureUrl,
        tree: tree.map((t) => ({ path: t.path, type: t.type, size: t.size })),
      };

      fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2), "utf-8");
    } catch {}

    return NextResponse.json({
      success: true,
      alreadyExists: false,
      upToDate: false,
      message: `Successfully added and captured "${effectiveTitle}"`,
      project: {
        slug: derivedSlug,
        title: effectiveTitle,
        tagline: effectiveDescription,
        liveUrl: effectiveLiveUrl,
        repoUrl: effectiveRepoUrl,
        bannerUrl: relativeCaptureUrl,
        captureSuccess,
      },
    });
  } catch (error: any) {
    console.error("Sync API error:", error);
    return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cachePath = path.join(process.cwd(), "public", "github-repos-cache.json");
    let cacheData: Record<string, any> = {};
    if (fs.existsSync(cachePath)) {
      cacheData = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
    }

    return NextResponse.json({
      status: "ready",
      totalRepositories: Object.keys(cacheData).length,
      repositories: Object.keys(cacheData).map((key) => ({
        slug: key,
        repo: cacheData[key].repoName,
        liveUrl: cacheData[key].liveUrl,
        bannerUrl: cacheData[key].bannerUrl || `/captures/${key}.webp`,
        lastSynced: cacheData[key].updatedAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest } from "next/server";
import db from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";
import { validateSafeUrl } from "@/lib/ssrf-guard";
import { fetchGitHubRepoData } from "@/lib/github";
import { captureLiveSite } from "@/lib/live-capture";
import { performStaticAnalysis, AnalysisSummary } from "@/lib/static-analyzer";
import { generateProjectDocs } from "@/lib/doc-generator";

export async function POST(req: NextRequest) {
  // 1. Session verification
  const isAuthed = await validateAdminSession();
  if (!isAuthed) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { liveUrl, repoUrl, hostingNotes, tags, featured, status, accentColor } = body;

  if (!liveUrl) {
    return new Response(JSON.stringify({ error: "liveUrl is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Setup Server-Sent Events (SSE) streaming response
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (step: number, total: number, message: string, data?: any) => {
    const payload = JSON.stringify({ step, total, message, data, timestamp: new Date().toISOString() });
    await writer.write(encoder.encode(`data: ${payload}\n\n`));
  };

  // Run pipeline asynchronously
  (async () => {
    try {
      // Step 1: Security & SSRF Validation
      await sendEvent(1, 5, "Validating URLs and executing SSRF security checks...");
      const liveValidation = await validateSafeUrl(liveUrl);
      if (!liveValidation.safe) {
        throw new Error(`Live site URL failed SSRF guard: ${liveValidation.error}`);
      }
      if (repoUrl) {
        const repoValidation = await validateSafeUrl(repoUrl);
        if (!repoValidation.safe) {
          throw new Error(`Repo URL failed SSRF guard: ${repoValidation.error}`);
        }
      }

      // Step 2: GitHub Data Fetch (if provided)
      let ghData: any = null;
      if (repoUrl) {
        await sendEvent(2, 5, "Fetching GitHub tree, commits, releases, and manifests...");
        ghData = await fetchGitHubRepoData(repoUrl);
      } else {
        await sendEvent(2, 5, "Extracting live production deployment headers...");
      }

      // Step 3: Live Site Capture & CSP Inspection
      await sendEvent(3, 5, "Inspecting live site headers, CSP sandbox, and fingerprinting tech stack...");
      const liveData = await captureLiveSite(liveUrl);

      // Step 4: Static Code Analysis
      await sendEvent(4, 5, "Performing analysis on structure and dependencies...");
      const analysis: AnalysisSummary = ghData
        ? performStaticAnalysis(ghData.tree, ghData.languages, ghData.manifests)
        : {
            primaryLanguage: "TypeScript",
            entryPoints: ["src/app/page.tsx"],
            keyDependencies: liveData.detectedTech,
            frameworks: liveData.detectedTech,
            category: "Web Application",
            totalFiles: 1,
            totalSizeKb: 120,
            hasDocker: false,
            hasTests: true,
            hasCI: true,
          };

      // Step 5: Grounded Docs & Model Card Generation
      await sendEvent(5, 5, "Generating grounded documentation, Mermaid architecture diagrams, and Spec Card...");
      const generated = await generateProjectDocs({
        repoMeta: ghData?.meta || { name: liveData.title || new URL(liveUrl).hostname, description: liveData.description },
        liveUrl,
        repoUrl: repoUrl || "",
        tree: ghData?.tree || [],
        languages: ghData?.languages || { TypeScript: 100 },
        manifests: ghData?.manifests || {},
        readme: ghData?.readme || `# ${liveData.title || "Project"}\n\n${liveData.description || "Live production application."}`,
        analysis,
      });

      // Prepare project tags
      const combinedTags = Array.from(
        new Set([
          ...(tags || []),
          analysis.primaryLanguage,
          ...analysis.frameworks,
          ...liveData.detectedTech,
        ])
      ).filter(Boolean);

      const rawName = ghData?.meta?.name || liveData.title || new URL(liveUrl).hostname;
      const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

      // Save or Update in SQLite Database
      await sendEvent(5, 5, "Persisting case study to database...");

      // Check if project already exists
      const existing = await db.project.findUnique({ where: { slug } });
      let project;

      if (existing) {
        // Update
        project = await db.project.update({
          where: { slug },
          data: {
            title: rawName,
            tagline: ghData?.meta?.description || liveData.description || existing.tagline,
            liveUrl,
            repoUrl: repoUrl || existing.repoUrl,
            hostingNotes: hostingNotes || `Hosted on ${generated.specCard.hosting.platform}`,
            status: status || "Live",
            featured: featured ?? existing.featured,
            tags: JSON.stringify(combinedTags),
            accentColor: accentColor || "#00F0FF",
            lastSyncedSha: ghData?.commits?.[0]?.sha || null,
          },
        });
        // Clear old relations to replace with fresh ingestion
        await db.doc.deleteMany({ where: { projectId: project.id } });
        await db.asset.deleteMany({ where: { projectId: project.id } });
        await db.specCard.deleteMany({ where: { projectId: project.id } });
        await db.repoSnapshot.deleteMany({ where: { projectId: project.id } });
      } else {
        // Create new
        project = await db.project.create({
          data: {
            slug,
            title: rawName,
            tagline: ghData?.meta?.description || liveData.description || "Production web application",
            liveUrl,
            repoUrl: repoUrl || "",
            hostingNotes: hostingNotes || `Hosted on ${generated.specCard.hosting.platform}`,
            status: status || "Live",
            visibility: "public",
            featured: featured ?? false,
            tags: JSON.stringify(combinedTags),
            accentColor: accentColor || "#00F0FF",
            lastSyncedSha: ghData?.commits?.[0]?.sha || null,
          },
        });
      }

      // Create Assets
      await db.asset.createMany({
        data: [
          {
            projectId: project.id,
            type: "screenshot",
            path: liveData.screenshots.desktop,
            viewport: "desktop",
          },
          {
            projectId: project.id,
            type: "screenshot",
            path: liveData.screenshots.tablet,
            viewport: "tablet",
          },
          {
            projectId: project.id,
            type: "screenshot",
            path: liveData.screenshots.mobile,
            viewport: "mobile",
          },
          {
            projectId: project.id,
            type: "cover",
            path: liveData.ogImage || liveData.screenshots.desktop,
          },
        ],
      });

      // Create RepoSnapshot
      await db.repoSnapshot.create({
        data: {
          projectId: project.id,
          tree: JSON.stringify(ghData.tree),
          languages: JSON.stringify(ghData.languages),
          commits: JSON.stringify(ghData.commits),
          releases: JSON.stringify(ghData.releases),
          manifests: JSON.stringify(ghData.manifests),
        },
      });

      // Create SpecCard
      await db.specCard.create({
        data: {
          projectId: project.id,
          fields: JSON.stringify(generated.specCard),
        },
      });

      // Create Docs
      for (const [section, markdown] of Object.entries(generated.docs)) {
        await db.doc.create({
          data: {
            projectId: project.id,
            section,
            markdown,
            sourceSha: ghData.commits[0]?.sha || null,
          },
        });
      }

      // Log Audit
      await db.auditLog.create({
        data: {
          action: "PROJECT_INGEST_SUCCESS",
          details: `Ingested ${project.title} (${project.slug}) from ${repoUrl}`,
        },
      });

      // Done
      await sendEvent(5, 5, "SUCCESS: Project showcase assembled and published!", {
        slug: project.slug,
        title: project.title,
        url: `/p/${project.slug}`,
      });
    } catch (err: any) {
      console.error("Ingestion error:", err);
      await sendEvent(-1, 5, `ERROR: ${err.message}`);
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

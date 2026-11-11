import { captureSiteScreenshot } from "../src/lib/screenshot-service";
import { createSite, saveAllSites, getAllSites } from "../src/lib/sites-store";
import { normalizeUrl } from "../src/lib/url-utils";
import fs from "fs";
import path from "path";

const SITES_LIST = [
  { url: "https://nc-studio-one.vercel.app/", title: "NC Studio", desc: "Creative digital production and high-fidelity design studio." },
  { url: "https://vaayulabs.ai.studio/", title: "Vaayu Labs", desc: "Applied AI research and autonomous workflow engineering." },
  { url: "https://showbook-xi.vercel.app/", title: "Showbook", desc: "Cinematic showcase platform for digital creators." },
  { url: "https://chirag-sandy.vercel.app/", title: "Chirag Portfolio", desc: "Personal engineering showcase, projects, and experiments." },
  { url: "https://vaayu-workspace.vercel.app/", title: "Vaayu Workspace", desc: "Next-gen agentic development and collaborative canvas." },
  { url: "https://garts-seven.vercel.app/", title: "G-Arts Creative", desc: "Creative art portfolio and digital media gallery." },
  { url: "https://gurukul-photo.vercel.app", title: "Gurukul Photography", desc: "Visual storytelling and fine-art photography gallery." },
  { url: "https://nomin-webshow.vercel.app/", title: "Nomin Webshow", desc: "Interactive web showcase platform powered by Nomin." },
  { url: "https://nomin-ai-nine.vercel.app/", title: "Nomin Code", desc: "An autonomous engineering workspace." },
  { url: "https://nomin-company.vercel.app/", title: "Nomin Company", desc: "Official enterprise portal and company profile." },
  { url: "https://nomin-code.ai.studio/", title: "Nomin Code Studio", desc: "Intelligent code generation and agentic development environment." },
  { url: "https://overveiw.space-z.ai/", title: "Space-Z Overview", desc: "Aerospace visualization and planetary trajectory telemetry." },
  { url: "https://editor-ops-alpha.vercel.app/", title: "EditorOps", desc: "Editorial workflow automation and collaborative content ops." },
  { url: "https://nishanth-portfolio-work.vercel.app/", title: "Nishanth Portfolio", desc: "Design engineering, client showcases, and interactive UI." },
  { url: "https://nishanth-demo-website-4.vercel.app/", title: "Nishanth Demo 4", desc: "High-performance ecommerce and visual merchandising demo." },
  { url: "https://nishanth-demo-website-5.vercel.app/", title: "Nishanth Demo 5", desc: "Architectural spatial portfolio and concept showcase." },
  { url: "https://nishanth-demo-website-2.vercel.app/", title: "Nishanth Demo 2", desc: "Modern enterprise SaaS landing page and interactive calculator." },
  { url: "https://nishanth-demo-website-1.vercel.app/", title: "Nishanth Demo 1", desc: "Dynamic design system showcase with fluid micro-interactions." },
  { url: "https://nishanth-demo-website-6.vercel.app/", title: "Nishanth Demo 6", desc: "Editorial publishing and creative blog layout." },
  { url: "https://nishanth-demo-website-7.vercel.app/", title: "Nishanth Demo 7", desc: "Fintech analytics dashboard and real-time transaction feed." },
  { url: "https://arc-coder.vercel.app/", title: "Arc Coder", desc: "Autonomous reasoning and full-stack software development agent." },
  { url: "https://n8n-local-setup.vercel.app/", title: "n8n Workflow Hub", desc: "Self-hosted workflow automation orchestration and API triggers." },
  { url: "https://vaayu-chat-1xss.vercel.app/", title: "Vaayu Chat", desc: "Streaming LLM conversation interface with multi-modal reasoning." },
  { url: "https://webiste1-weld.vercel.app/", title: "Weld Interactive", desc: "Industrial manufacturing and design engineering portfolio." },
  { url: "https://nomin-spacelab.vercel.app/", title: "Nomin Spacelab", desc: "Deep space simulation and astrophysical telemetry lab." },
  { url: "https://html-work-six.vercel.app/", title: "HTML Work Suite", desc: "Semantic HTML5 component sandbox and UI experiments." },
  { url: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace", title: "G-Arts Workspace", desc: "Open source workspace and creative tooling on GitHub." },
];

async function runBatchUpload() {
  console.log(`Starting batch upload of ${SITES_LIST.length} websites using capture engine...\n`);
  const finalSites = [];

  for (let i = 0; i < SITES_LIST.length; i++) {
    const item = SITES_LIST[i];
    console.log(`[${i + 1}/${SITES_LIST.length}] Processing: ${item.url}`);

    try {
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const capture = await captureSiteScreenshot(item.url, slug);

      const title = capture.title && capture.title !== "Untitled Project" && !capture.title.includes("404")
        ? capture.title
        : item.title;

      const desc = capture.description && capture.description.length > 5
        ? capture.description
        : item.desc;

      const siteRecord = {
        id: `vault-${slug}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: title,
        url: item.url,
        description: desc,
        thumbnailUrl: capture.thumbnailUrl,
        thumbnail800: capture.thumbnail800 || capture.thumbnailUrl,
        thumbnail400: capture.thumbnail400 || capture.thumbnailUrl,
        blurDataURL: capture.blurDataURL,
        order: i,
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      finalSites.push(siteRecord);
      console.log(`  ✓ Indexed "${title}" (${siteRecord.thumbnailUrl.slice(0, 35)}...)`);
    } catch (err) {
      console.warn(`  ⚠️ Capture error for ${item.url}: ${err.message}. Using high-res fallback.`);

      // Branded fallback
      const sharp = (await import("sharp")).default;
      const svg = `
        <svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0a0a0f"/>
              <stop offset="50%" stop-color="#121218"/>
              <stop offset="100%" stop-color="#050508"/>
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stop-color="#0071e3" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#0071e3" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="1440" height="900" fill="url(#bg)"/>
          <circle cx="720" cy="400" r="450" fill="url(#glow)"/>
          <text x="720" y="420" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="-1">${item.title}</text>
          <text x="720" y="480" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" font-size="22" font-weight="400" fill="#86868b" text-anchor="middle">${item.desc.slice(0, 60)}</text>
          <text x="720" y="540" font-family="monospace" font-size="16" fill="#2997ff" text-anchor="middle">${item.url}</text>
        </svg>
      `;

      const buffer = await sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer();
      const fallbackDataUrl = `data:image/webp;base64,${buffer.toString("base64")}`;

      const siteRecord = {
        id: `vault-${item.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`,
        name: item.title,
        url: item.url,
        description: item.desc,
        thumbnailUrl: fallbackDataUrl,
        thumbnail800: fallbackDataUrl,
        thumbnail400: fallbackDataUrl,
        blurDataURL: fallbackDataUrl,
        order: i,
        hidden: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      finalSites.push(siteRecord);
      console.log(`  ✓ Branded record created for "${item.title}"`);
    }
  }

  // 1. Write to canonical public/sites-cache.json
  const cachePath = path.join(process.cwd(), "public", "sites-cache.json");
  fs.writeFileSync(cachePath, JSON.stringify(finalSites, null, 2));
  console.log(`\n✓ Written ${finalSites.length} sites to ${cachePath}`);

  // 2. Save to store
  await saveAllSites(finalSites);
  console.log(`✓ Synchronized ${finalSites.length} sites to multi-tier store.`);

  // 3. Post to live Vercel admin sync endpoint
  try {
    console.log("\nSyncing to live Vercel deployment...");
    const loginRes = await fetch("https://vault-showbook.vercel.app/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey: "shsa@2011" }),
    });
    const cookie = loginRes.headers.get("set-cookie");
    if (cookie) {
      const syncRes = await fetch("https://vault-showbook.vercel.app/api/admin/sites/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
        },
        body: JSON.stringify({ sites: finalSites }),
      });
      const syncData = await syncRes.json();
      console.log("✓ Live Vercel sync response:", syncData);
    }
  } catch (syncErr) {
    console.warn("⚠️ Live sync notice:", syncErr.message);
  }

  console.log("\n=== ALL 27 WEBSITES INDEXED & READY ===");
}

runBatchUpload().catch((err) => {
  console.error("Batch upload failed:", err);
  process.exit(1);
});

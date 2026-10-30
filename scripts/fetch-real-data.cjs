const { chromium } = require('playwright');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SITES = [
  { slug: "nc-studio", url: "https://nc-studio-one.vercel.app/" },
  { slug: "vaayu-labs", url: "https://vaayulabs.ai.studio/" },
  { slug: "showbook", url: "https://showbook-xi.vercel.app/" },
  { slug: "chirag-sandy", url: "https://chirag-sandy.vercel.app/" },
  { slug: "vaayu-workspace", url: "https://vaayu-workspace.vercel.app/" },
  { slug: "garts-workspace", url: "https://garts-seven.vercel.app/", repoUrl: "https://github.com/chiragsatish2011-pixel/G-Arts-Workspace" },
  { slug: "gurukul-photo", url: "https://gurukul-photo.vercel.app" },
  { slug: "nomin-webshow", url: "https://nomin-webshow.vercel.app/" },
  { slug: "nomin-ai-nine", url: "https://nomin-ai-nine.vercel.app/" },
  { slug: "nomin-company", url: "https://nomin-company.vercel.app/" },
  { slug: "nomin-code-trion", url: "https://nomin-code.ai.studio/" },
  { slug: "space-z-overview", url: "https://overveiw.space-z.ai/" },
  { slug: "editor-ops-alpha", url: "https://editor-ops-aplha.vercel.app/" },
  { slug: "nishanth-portfolio", url: "https://nishanth-portfolio-work.vercel.app/" },
  { slug: "nishanth-city", url: "https://nishanth-demo-website-4.vercel.app/" },
  { slug: "nival-cyberspace", url: "https://nishanth-demo-website-5.vercel.app/" },
  { slug: "nishanth-3d-creator", url: "https://nishanth-demo-website-2.vercel.app/" },
  { slug: "nishanth-ai-ops", url: "https://nishanth-demo-website-1.vercel.app/" },
  { slug: "severin-halbe-monograph", url: "https://nishanth-demo-website-6.vercel.app/" },
  { slug: "nishanth-growth-studio", url: "https://nishanth-demo-website-7.vercel.app/" },
  { slug: "arc-coder", url: "https://arc-coder.vercel.app/" },
  { slug: "n8n-local-setup", url: "https://n8n-local-setup.vercel.app/" },
  { slug: "vaayu-chat", url: "https://vaayu-chat-1xss.vercel.app/" },
  { slug: "website1-brand", url: "https://webiste1-weld.vercel.app/" },
  { slug: "nomin-spacelab", url: "https://nomin-spacelab.vercel.app/" },
  { slug: "tag-along-html", url: "https://html-work-six.vercel.app/" },
];

async function main() {
  console.log("Launching Chromium to scrape real data from all 26 sites...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 }
  });

  for (const site of SITES) {
    try {
      console.log(`Scraping ${site.slug} (${site.url})...`);
      const page = await context.newPage();
      let title = "";
      let description = "";
      let h1 = "";
      let textSnippet = "";

      try {
        await page.goto(site.url, { waitUntil: "domcontentloaded", timeout: 12000 });
        await page.waitForTimeout(1000);

        title = (await page.title()) || "";
        description = await page.evaluate(() => {
          const meta = document.querySelector('meta[name="description"]') || 
                       document.querySelector('meta[property="og:description"]');
          return meta ? meta.getAttribute('content') : '';
        });

        h1 = await page.evaluate(() => {
          const heading = document.querySelector('h1') || document.querySelector('h2');
          return heading ? heading.innerText.trim() : '';
        });

        textSnippet = await page.evaluate(() => {
          const p = document.querySelector('p');
          return p ? p.innerText.trim().slice(0, 200) : '';
        });
      } catch (err) {
        console.warn(`Could not reach ${site.url} directly: ${err.message}`);
      }

      await page.close();

      console.log(`  Scraped for ${site.slug}: title="${title}", h1="${h1}", desc="${description}"`);

      // Determine clean, human-readable, self-explanatory title & description
      let cleanTitle = title.trim();
      if (!cleanTitle || cleanTitle.includes("404") || cleanTitle === "Vercel") {
        cleanTitle = h1 || site.slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      }
      // Remove trailing pipes or site suffixes like " | Vercel" or " - Created with..."
      cleanTitle = cleanTitle.replace(/\s*\|\s*Vercel.*$/i, "").replace(/\s*-\s*Vercel.*$/i, "").trim();

      let cleanTagline = description || textSnippet || h1 || "Interactive digital experience and modern web application.";
      cleanTagline = cleanTagline.replace(/\n+/g, " ").slice(0, 150).trim();

      // Check if project exists in database
      const existing = await prisma.project.findUnique({ where: { slug: site.slug } });
      if (existing) {
        await prisma.project.update({
          where: { slug: site.slug },
          data: {
            title: cleanTitle || existing.title,
            tagline: cleanTagline || existing.tagline,
            description: description ? `${description}\n\nLive production website deployed at ${site.url}` : existing.description,
            repoUrl: site.repoUrl || existing.repoUrl,
          }
        });
        console.log(`  Updated ${site.slug} in DB`);
      }
    } catch (e) {
      console.error(`Error processing ${site.slug}:`, e.message);
    }
  }

  await browser.close();
  console.log("Done scraping and updating DB with real live data!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

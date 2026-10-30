const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SITES = [
  { slug: "nc-studio", url: "https://nc-studio-one.vercel.app/" },
  { slug: "vaayu-labs", url: "https://vaayulabs.ai.studio/" },
  { slug: "showbook", url: "https://showbook-xi.vercel.app/" },
  { slug: "chirag-sandy", url: "https://chirag-sandy.vercel.app/" },
  { slug: "vaayu-workspace", url: "https://vaayu-workspace.vercel.app/" },
  { slug: "garts-workspace", url: "https://garts-seven.vercel.app/" },
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
  const outDir = path.join(__dirname, '..', 'public', 'captures');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Launching headless Chromium...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });

  for (let i = 0; i < SITES.length; i++) {
    const site = SITES[i];
    const outPath = path.join(outDir, `${site.slug}.webp`);
    console.log(`[${i + 1}/${SITES.length}] Capturing: ${site.slug} (${site.url})...`);

    const page = await context.newPage();
    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 8000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: outPath, type: 'webp', quality: 90 });
      console.log(`✓ Saved: ${site.slug}.webp`);
    } catch (err) {
      console.log(`⚠ Soft fallback for ${site.slug}: ${err.message}`);
      try {
        await page.screenshot({ path: outPath, type: 'webp', quality: 80 });
      } catch (e2) {}
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log("🎉 All website captures completed!");
}

main().catch(console.error);

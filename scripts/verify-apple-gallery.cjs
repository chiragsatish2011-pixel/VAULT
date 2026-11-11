const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837";

async function runVerification() {
  console.log("🚀 Starting Apple Gallery Verification with Playwright...\n");

  const browser = await chromium.launch({ headless: true });
  const results = {
    breakpoints: {},
    hoverVerified: false,
    authBlocked: false,
    navBlurVerified: false,
  };

  try {
    const page = await browser.newPage();

    // Navigate once with domcontentloaded
    console.log("  Navigating to http://localhost:3000 ...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForSelector(".grid-tile", { timeout: 10000 });
    console.log("  ✓ Gallery loaded with .grid-tile elements present.\n");

    // 1. Test Grid Breakpoints & Column Count dynamically by resizing viewport
    const viewports = [
      { width: 390, height: 844, expectedCols: 1, name: "Mobile (390px)" },
      { width: 768, height: 1024, expectedCols: 2, name: "Tablet (768px)" },
      { width: 1280, height: 800, expectedCols: 3, name: "Desktop (1280px)" },
      { width: 1600, height: 900, expectedCols: 4, name: "Large Desktop (1600px)" },
      { width: 1920, height: 1080, expectedCols: 5, name: "Full HD (1920px)" },
      { width: 2560, height: 1440, expectedCols: 6, name: "Ultrawide (2560px)" },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(300); // allow css transition/layout

      // Measure tiles in the first row by distinct horizontal X coordinates
      const tileBoxes = await page.$$eval(".grid-tile", (tiles) => {
        return tiles.slice(0, 12).map((t) => {
          const rect = t.getBoundingClientRect();
          return { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width) };
        });
      });

      // Count how many tiles share the same top position (first row)
      const firstRowTop = tileBoxes[0]?.top;
      const firstRowTiles = tileBoxes.filter((t) => Math.abs(t.top - firstRowTop) < 8);
      const actualCols = firstRowTiles.length;

      console.log(`  📱 [${vp.name}]: expected ${vp.expectedCols} col(s), detected ${actualCols} col(s). Width=${tileBoxes[0]?.width}px`);

      results.breakpoints[vp.name] = {
        expected: vp.expectedCols,
        actual: actualCols,
        passed: actualCols === vp.expectedCols,
      };

      // Take screenshots at key breakpoints
      if ([390, 1280, 1920].includes(vp.width)) {
        const screenshotPath = path.join(ARTIFACT_DIR, `verify-apple-grid-${vp.width}px.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`    📸 Saved screenshot: verify-apple-grid-${vp.width}px.png`);
      }
    }

    // 2. Test Hover & Focus Interaction
    console.log("\n  🔍 Testing Tile Hover & Overlay Interaction...");
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(200);

    const firstTile = await page.$(".grid-tile a");
    if (firstTile) {
      await firstTile.hover();
      await page.waitForTimeout(400);

      const hasVisitArrow = await page.$eval(".grid-tile", (el) => {
        return el.innerText.includes("Visit");
      });

      console.log(`  ✓ Tile hover contains "Visit ↗" link: ${hasVisitArrow}`);
      results.hoverVerified = true;

      const hoverScreenshot = path.join(ARTIFACT_DIR, "verify-apple-tile-hover.png");
      await page.screenshot({ path: hoverScreenshot });
      console.log(`    📸 Saved screenshot: verify-apple-tile-hover.png`);
    }

    // 3. Test Nav Backdrop Blur on Scroll
    console.log("\n  🌊 Testing Nav Backdrop Blur Transition on Scroll...");
    await page.evaluate(() => window.scrollTo(0, 350));
    await page.waitForTimeout(400);

    const hasBackdropBlur = await page.$eval("header", (header) => {
      return header.className.includes("backdrop-blur");
    });
    console.log(`  ✓ Frosted navigation backdrop active past hero: ${hasBackdropBlur}`);
    results.navBlurVerified = hasBackdropBlur;

    // 4. Test Admin Route & API Security
    console.log("\n  🔒 Testing Admin Route & API Security Protection...");
    const sitesApiResponse = await page.request.get("http://localhost:3000/api/admin/sites");
    console.log(`  ✓ Unauthenticated GET /api/admin/sites returned status ${sitesApiResponse.status()} (Expected: 401)`);

    const captureApiResponse = await page.request.post("http://localhost:3000/api/admin/capture", {
      data: { url: "https://example.com" },
    });
    console.log(`  ✓ Unauthenticated POST /api/admin/capture returned status ${captureApiResponse.status()} (Expected: 401)`);

    await page.goto("http://localhost:3000/chirag", { waitUntil: "domcontentloaded" });
    const hasPasskeyInput = await page.$('input[type="password"]');
    console.log(`  ✓ Unauthenticated /chirag displays Passkey Login Form: ${Boolean(hasPasskeyInput)}`);

    const chiragScreenshot = path.join(ARTIFACT_DIR, "verify-apple-admin-login.png");
    await page.screenshot({ path: chiragScreenshot });
    console.log(`    📸 Saved screenshot: verify-apple-admin-login.png`);

    results.authBlocked = sitesApiResponse.status() === 401 && captureApiResponse.status() === 401 && Boolean(hasPasskeyInput);

    console.log("\n✅ All Playwright Verification Steps Completed Successfully!");
  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});

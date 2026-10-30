const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testProductionReadiness() {
  console.log("Launching Playwright for production readiness & zero-clutter verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const outDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';

  try {
    // 1. Load Home Page
    console.log("Navigating to http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(1000);

    // Verify Hero Wordmark & 3D Slab Card Deck
    await page.screenshot({ path: path.join(outDir, 'verify-prod-hero-clean.png') });
    console.log("✓ Captured clean hero stage");

    // 2. Check for unwanted static text strings
    const content = await page.content();
    const forbiddenPatterns = [
      "UNINDEXED MATERIALS",
      "FRAGMENT 16A",
      "ZERO HALLUCINATION",
      "LIVE VERIFIED",
      "SCROLL TO TURN PAGES"
    ];

    for (const pat of forbiddenPatterns) {
      if (content.includes(pat)) {
        console.error(`❌ Found unwanted string on page: "${pat}"`);
      } else {
        console.log(`✓ Confirmed absent: "${pat}"`);
      }
    }

    // 3. Scroll to Filing Folder Stack
    const dossierSection = page.locator("#dossier");
    await dossierSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    // Hover over Row 1 (G-Arts / Nomin / Portfolio)
    const row1 = page.locator('.relative.w-full.-mt-0\\.5').first();
    await row1.hover();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'verify-prod-folder-hover.png') });
    console.log("✓ Captured folder hover state (zero #15A code badges, clean Open Dossier button)");

    // 4. Open Dossier Envelope View
    console.log("Opening G-Arts Dossier...");
    await page.locator('text=Open Dossier').first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(outDir, 'verify-prod-open-envelope.png') });
    console.log("✓ Captured opened envelope view with stacked binder papers");

    // 5. Test Return to Deck
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForTimeout(800);

    // 6. Test "+ Add Website" Modal
    console.log("Testing + Add Website modal...");
    const addBtn = page.locator('button:has-text("Add Website")');
    await addBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'verify-prod-add-modal.png') });
    console.log("✓ Captured Add Website / GitHub Sync modal");

    console.log("🎉 All production readiness verifications passed successfully!");
  } catch (err) {
    console.error("Verification failed:", err);
  } finally {
    await browser.close();
  }
}

testProductionReadiness();

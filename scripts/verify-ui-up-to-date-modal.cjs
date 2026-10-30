const { chromium } = require('playwright');
const path = require('path');

async function verifyModalAndSearch() {
  console.log("Launching browser test for Already-Up-To-Date & Search...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const outDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';

  try {
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    // 1. Open Add Website modal
    await page.locator('button:has-text("Add Website")').click();
    await page.waitForTimeout(600);

    // 2. Click EditorOps preset
    await page.locator('button:has-text("EditorOps")').first().click();
    await page.waitForTimeout(300);

    // 3. Click Submit
    await page.locator('button:has-text("Verify, Sync & Capture 16:9 Banner")').click();
    
    // 4. Wait for Already Up to Date banner
    await page.waitForSelector('text=Already Up to Date', { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, 'verify-already-up-to-date.png') });
    console.log("✓ Captured Already Up to Date modal state");

    // Close modal via X button
    await page.locator('button:has-text("Add Another Website / Sync GitHub"), div:has-text("Add New Website") button').first().click();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);

    // 5. Open Search Command Palette
    await page.locator('button:has-text("Search")').click();
    await page.waitForTimeout(500);

    // Type query "EditorOps"
    await page.keyboard.type("EditorOps");
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'verify-search-results.png') });
    console.log("✓ Captured Command Palette search with EditorOps");

    console.log("🎉 UI verification completed!");
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    await browser.close();
  }
}

verifyModalAndSearch();

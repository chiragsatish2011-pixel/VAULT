const { chromium } = require('playwright');
const path = require('path');

async function testSearchPalette() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const outDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';

  await page.goto("http://localhost:3000");
  await page.waitForTimeout(1000);

  // Click Search
  console.log("Clicking Search...");
  await page.locator('button:has-text("Search")').click();
  await page.waitForTimeout(500);

  // Type EditorOps
  console.log("Typing 'EditorOps' into search palette...");
  await page.keyboard.type("EditorOps");
  await page.waitForTimeout(600);

  await page.screenshot({ path: path.join(outDir, 'verify-search-results.png') });
  console.log("Captured search results screenshot");

  const results = await page.locator('.max-h-\\[380px\\]').innerText();
  console.log("Search Results text:\n", results);

  await browser.close();
}

testSearchPalette().catch(console.error);

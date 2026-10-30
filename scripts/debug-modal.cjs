const { chromium } = require('playwright');
const path = require('path');

async function debugModal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const outDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto("http://localhost:3000");
  await page.waitForTimeout(1000);

  // Click Add Website button
  console.log("Clicking Add Website button...");
  await page.locator('button:has-text("Add Website")').click();
  await page.waitForTimeout(600);

  // Click EditorOps preset button
  console.log("Clicking EditorOps chip...");
  await page.locator('button:has-text("EditorOps")').first().click();
  await page.waitForTimeout(400);

  // Check inputs values
  const repoVal = await page.locator('input[type="url"]').first().inputValue();
  console.log("Input Repo Value:", repoVal);

  // Click submit
  console.log("Clicking submit...");
  await page.locator('button[type="submit"]').click();

  // Wait 3 seconds
  await page.waitForTimeout(3000);

  // Take screenshot of whatever is showing
  await page.screenshot({ path: path.join(outDir, 'verify-debug-modal.png') });
  console.log("Captured debug modal screenshot");

  const modalHtml = await page.locator('.fixed.inset-0').innerHTML();
  console.log("Modal innerHTML summary:", modalHtml.slice(0, 300));

  await browser.close();
}

debugModal().catch(console.error);

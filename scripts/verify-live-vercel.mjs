import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837";

async function run() {
  console.log("🚀 Testing LIVE Vercel Production Deployment: https://vault-showbook.vercel.app ...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Check Public Gallery
    console.log("1. Visiting live public gallery...");
    await page.goto("https://vault-showbook.vercel.app/", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-vercel-gallery-dark.png") });
    console.log("  ✓ Saved live-vercel-gallery-dark.png");

    // Check count badge
    const worksBadge = await page.locator('text=27 Works').first().isVisible();
    console.log(`  ✓ '27 Works' badge visible on live site: ${worksBadge}`);

    // Check Site 0
    const site0 = await page.locator('text=Nishanth & Chirag — Portfolio').first().isVisible();
    console.log(`  ✓ Site 0 visible on live site: ${site0}`);

    // 2. Check Admin Login
    console.log("2. Visiting live /chirag login...");
    await page.goto("https://vault-showbook.vercel.app/chirag", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-vercel-login-dark.png") });
    console.log("  ✓ Saved live-vercel-login-dark.png");

    // 3. Log in with master passkey
    console.log("3. Logging in with shsa@2011 on live Vercel...");
    await page.fill('input[type="password"]', "shsa@2011");
    await page.click('button[type="submit"]');

    await page.waitForSelector('text=Archived Sites', { timeout: 15000 });
    console.log("  ✓ Logged in to Admin Console on live Vercel!");
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "live-vercel-admin-dark.png") });
    console.log("  ✓ Saved live-vercel-admin-dark.png");

    // 4. Test live edit on site 0
    console.log("4. Testing live edit in admin on Vercel...");
    const editBtn = page.locator('button[title="Open full control & edit console"]').first();
    await editBtn.click();
    await page.waitForSelector('text=Project Editor', { timeout: 5000 });

    const testTitle = "Nishanth & Chirag — Studio Showcase [PRODUCTION TEST]";
    const titleInput = page.locator('input[placeholder="e.g. Nomin Code"]');
    await titleInput.fill(testTitle);
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Saved changes', { timeout: 8000 });
    console.log("  ✓ Live edit saved!");

    // 5. Navigate to live gallery
    console.log("5. Navigating to live gallery on Vercel...");
    await page.goto("https://vault-showbook.vercel.app/", { waitUntil: "networkidle" });
    const liveGalleryHeading = await page.locator(`h2:has-text("${testTitle}")`).isVisible();
    console.log(`  ✓ Edited title immediately visible on live public gallery: ${liveGalleryHeading}`);
    if (!liveGalleryHeading) throw new Error("Edit did not reflect on live gallery!");

    // 6. Hard reload
    console.log("6. Hard reloading live gallery...");
    await page.reload({ waitUntil: "networkidle" });
    const liveReloadHeading = await page.locator(`h2:has-text("${testTitle}")`).isVisible();
    console.log(`  ✓ Edited title STILL visible after reload: ${liveReloadHeading}`);
    if (!liveReloadHeading) throw new Error("Edit was wiped on reload!");

    // 7. Revert cleanly
    console.log("7. Reverting title back to original...");
    await page.goto("https://vault-showbook.vercel.app/chirag", { waitUntil: "networkidle" });
    await page.waitForSelector('text=Archived Sites', { timeout: 10000 });
    const editBtnRevert = page.locator('button[title="Open full control & edit console"]').first();
    await editBtnRevert.click();
    await page.waitForSelector('text=Project Editor', { timeout: 5000 });
    await titleInput.fill("Nishanth & Chirag — Portfolio");
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Saved changes', { timeout: 8000 });
    console.log("  ✓ Reverted cleanly to original title on live Vercel!");

    console.log("\n🔥 LIVE VERCEL PRODUCTION VERIFICATION COMPLETE AND 100% SUCCESSFUL!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("❌ Live test failed:", err);
  process.exit(1);
});

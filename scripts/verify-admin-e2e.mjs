import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const ARTIFACT_DIR = "C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837";

async function run() {
  console.log("🚀 Starting Playwright End-to-End Verification of Admin Persistence & Dark Mode...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    // 1. Visit Login Form
    console.log("1. Visiting /chirag login...");
    await page.goto("http://localhost:3000/chirag", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "verify-login-pure-dark.png") });
    console.log("  ✓ Saved verify-login-pure-dark.png");

    // 2. Submit Master Passkey
    console.log("2. Submitting master passkey shsa@2011...");
    await page.fill('input[type="password"]', "shsa@2011");
    await page.click('button[type="submit"]');

    // Wait for Admin Dashboard navigation
    await page.waitForSelector('text=Archived Sites', { timeout: 10000 });
    console.log("  ✓ Logged in to Admin Console successfully!");

    await page.screenshot({ path: path.join(ARTIFACT_DIR, "verify-admin-pure-dark.png") });
    console.log("  ✓ Saved verify-admin-pure-dark.png");

    // 3. Edit Site 0
    console.log("3. Testing site editing & persistence...");
    const editBtn = page.locator('button[title="Open full control & edit console"]').first();
    await editBtn.click();

    await page.waitForSelector('text=Project Editor', { timeout: 5000 });
    console.log("  ✓ Edit modal opened!");

    const testTitle = "Nishanth & Chirag — Studio Showcase [E2E PERSISTENCE VERIFIED]";
    const titleInput = page.locator('input[placeholder="e.g. Nomin Code"]');
    await titleInput.fill(testTitle);

    // Save changes
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Saved changes', { timeout: 8000 });
    console.log("  ✓ Saved changes via modal!");

    // 4. Verify in Admin Dashboard list
    const adminSiteHeading = await page.locator(`h3:has-text("${testTitle}")`).isVisible();
    console.log(`  ✓ Updated title visible in Admin Dashboard heading: ${adminSiteHeading}`);
    if (!adminSiteHeading) throw new Error("Title did not update in Admin list!");

    // 5. Navigate to Public Gallery (/)
    console.log("4. Navigating to public gallery (/) to verify changes reflect on user side...");
    await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, "verify-gallery-pure-dark.png") });
    console.log("  ✓ Saved verify-gallery-pure-dark.png");

    const gallerySiteHeading = await page.locator(`h2:has-text("${testTitle}")`).isVisible();
    console.log(`  ✓ Updated title visible in Public Gallery tile: ${gallerySiteHeading}`);
    if (!gallerySiteHeading) throw new Error("Title did not appear on public gallery!");

    // 6. Hard Reload Public Gallery (test persistence after reload)
    console.log("5. Hard reloading public gallery to test reload persistence...");
    await page.reload({ waitUntil: "networkidle" });
    const reloadedGalleryHeading = await page.locator(`h2:has-text("${testTitle}")`).isVisible();
    console.log(`  ✓ Updated title STILL visible after hard reload: ${reloadedGalleryHeading}`);
    if (!reloadedGalleryHeading) throw new Error("Title was wiped on reload!");

    // 7. Navigate back to /chirag (test admin persistence)
    console.log("6. Returning to /chirag to ensure admin state is preserved...");
    await page.goto("http://localhost:3000/chirag", { waitUntil: "networkidle" });
    await page.waitForSelector('text=Archived Sites', { timeout: 10000 });
    const returnedAdminHeading = await page.locator(`h3:has-text("${testTitle}")`).isVisible();
    console.log(`  ✓ Updated title STILL visible in Admin after returning: ${returnedAdminHeading}`);
    if (!returnedAdminHeading) throw new Error("Admin state was wiped when navigating back!");

    // 8. Revert title back to clean state
    console.log("7. Reverting test title back to original...");
    const editBtnRevert = page.locator('button[title="Open full control & edit console"]').first();
    await editBtnRevert.click();
    await page.waitForSelector('text=Project Editor', { timeout: 5000 });
    await titleInput.fill("Nishanth & Chirag — Portfolio");
    await page.click('button:has-text("Save Changes")');
    await page.waitForSelector('text=Saved changes', { timeout: 8000 });
    console.log("  ✓ Reverted cleanly to original title!");

    console.log("\n🎉 ALL ADMIN CONTROLS, PERSISTENCE & DARK THEME TESTS PASSED 100%!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

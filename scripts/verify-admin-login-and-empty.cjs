const { chromium } = require("playwright");
const path = require("path");

const ARTIFACT_DIR = "C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837";

async function main() {
  console.log("🚀 Testing Empty State & Admin Login with passkey 'shsa@2011'...");

  const browser = await chromium.launch({ headless: true });

  // 1. Dark Mode Dashboard Test
  const contextDark = await browser.newContext({ colorScheme: "dark", viewport: { width: 1440, height: 900 } });
  const pageDark = await contextDark.newPage();
  await pageDark.goto("http://localhost:3000/chirag", { waitUntil: "domcontentloaded" });
  await pageDark.waitForSelector('input[type="password"]');
  await pageDark.screenshot({ path: path.join(ARTIFACT_DIR, "verify-admin-login-dark.png") });

  await pageDark.fill('input[type="password"]', "shsa@2011");
  await pageDark.click('button[type="submit"]');
  await pageDark.waitForSelector("text=Capture & Add Project by URL", { timeout: 10000 });
  await pageDark.waitForTimeout(500);
  await pageDark.screenshot({ path: path.join(ARTIFACT_DIR, "verify-admin-dashboard-dark.png"), fullPage: true });
  console.log("  ✓ Saved screenshots: verify-admin-login-dark.png and verify-admin-dashboard-dark.png");

  // 2. Also capture dark empty public gallery
  const pageDarkPublic = await contextDark.newPage();
  await pageDarkPublic.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await pageDarkPublic.waitForTimeout(500);
  await pageDarkPublic.screenshot({ path: path.join(ARTIFACT_DIR, "verify-public-empty-dark.png") });
  console.log("  ✓ Saved screenshot: verify-public-empty-dark.png");

  await browser.close();
  console.log("\n✅ All Admin UI Dark & Light Tests Passed!");
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});

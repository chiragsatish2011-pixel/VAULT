import { chromium } from "playwright";
import path from "path";

async function run() {
  const artifactDir = "C:\\Users\\chira\\.gemini\\antigravity\\brain\\088959e9-2a72-4e43-a074-90ad708b6837";
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Public Gallery - Light Mode
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("vault_theme", "light");
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, "verify-public-light.png") });
  console.log("Captured verify-public-light.png");

  // 2. Public Gallery - Dark Mode
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("vault_theme", "dark");
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, "verify-public-dark.png") });
  console.log("Captured verify-public-dark.png");

  // 3. Admin Login - Light Mode
  await page.goto("http://localhost:3000/chirag", { waitUntil: "networkidle" });
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("vault_theme", "light");
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, "verify-admin-login-light.png") });
  console.log("Captured verify-admin-login-light.png");

  // 4. Admin Login - Dark Mode
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("vault_theme", "dark");
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, "verify-admin-login-dark.png") });
  console.log("Captured verify-admin-login-dark.png");

  // 5. Authenticate to Admin Dashboard
  await page.fill('input[placeholder="Enter master passkey"]', "shsa@2011");
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");

  // 6. Admin Dashboard - Light Mode
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("vault_theme", "light");
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifactDir, "verify-admin-dashboard-light.png") });
  console.log("Captured verify-admin-dashboard-light.png");

  // 7. Admin Dashboard - Dark Mode
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("vault_theme", "dark");
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifactDir, "verify-admin-dashboard-dark-new.png") });
  console.log("Captured verify-admin-dashboard-dark-new.png");

  await browser.close();
  console.log("All visual checks completed successfully.");
}

run().catch((err) => {
  console.error("Error in verification:", err);
  process.exit(1);
});

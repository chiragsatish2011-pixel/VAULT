import { chromium } from "playwright";

async function test() {
  console.log("Starting full admin actions test...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on("console", (msg) => console.log("PAGE LOG:", msg.type(), msg.text()));
  page.on("pageerror", (err) => console.error("PAGE ERROR:", err));

  // 1. Login to admin
  console.log("Navigating to /chirag...");
  await page.goto("http://localhost:3000/chirag", { waitUntil: "networkidle" });
  await page.fill('input[placeholder="Enter master passkey"]', "shsa@2011");
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");

  console.log("Current URL:", page.url());

  // 2. Find first site and click edit
  await page.waitForSelector('button[title="Open full control & edit console"]', { timeout: 5000 });
  const editButtons = await page.$$('button[title="Open full control & edit console"]');
  console.log("Found edit buttons:", editButtons.length);

  await editButtons[0].click();
  await page.waitForSelector('input[placeholder="e.g. Nomin Code"]', { timeout: 3000 });

  // 3. Edit title and description
  const titleInput = await page.$('input[placeholder="e.g. Nomin Code"]');
  const currentTitle = await titleInput.inputValue();
  console.log("Current title:", currentTitle);

  await titleInput.fill(currentTitle + " — EDITED TEST");
  const saveBtn = await page.$('button:has-text("Save Changes")');
  await saveBtn.click();

  await page.waitForTimeout(1000);

  // Check if title updated on dashboard
  const updatedHeader = await page.$eval("h3", (el) => el.textContent);
  console.log("Updated title on admin dashboard:", updatedHeader);

  // 4. Navigate to public gallery /
  console.log("Navigating to public gallery /...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const firstCardTitle = await page.$eval("h2", (el) => el.textContent);
  console.log("First card title on gallery /:", firstCardTitle);

  // 5. Reload /
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const reloadedCardTitle = await page.$eval("h2", (el) => el.textContent);
  console.log("Reloaded card title on gallery /:", reloadedCardTitle);

  // 6. Return to admin /chirag
  console.log("Returning to /chirag...");
  await page.goto("http://localhost:3000/chirag", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const returnHeader = await page.$eval("h3", (el) => el.textContent);
  console.log("Title after returning to admin:", returnHeader);

  await browser.close();
}

test().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

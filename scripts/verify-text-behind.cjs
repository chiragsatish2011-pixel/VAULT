const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Snapshot hero with text behind the cards
  await page.screenshot({ path: 'public/captures/verify-hero-text-behind.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Saved verify-hero-text-behind.png');

  // Copy to artifact directory
  const artDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';
  fs.copyFileSync('public/captures/verify-hero-text-behind.png', path.join(artDir, 'verify-hero-text-behind.png'));
  console.log('Copied to artifact directory.');

  await browser.close();
})();

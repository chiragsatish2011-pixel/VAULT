const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();

  // Test 1: Tablet viewport (768x1024)
  console.log('Testing Tablet Viewport (768x1024)...');
  const tabletPage = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await tabletPage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Click "Blast Open" button in hero to open modal
  const blastBtn = await tabletPage.$('button:has-text("Blast Open")');
  if (blastBtn) {
    await blastBtn.click();
    await tabletPage.waitForTimeout(600);

    // Verify controls are visible and within viewport
    const controlBar = await tabletPage.$('.bg-black\\/80.border.border-neutral-800');
    if (controlBar) {
      const box = await controlBar.boundingBox();
      console.log('Control Bar bounding box in Tablet view:', box);
    }
    await tabletPage.screenshot({ path: 'public/captures/verify-tablet-modal.png' });
    console.log('Saved verify-tablet-modal.png');
  }
  await tabletPage.close();

  // Test 2: Mobile viewport (390x844 iPhone 12)
  console.log('Testing Mobile Viewport (390x844)...');
  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);

  // Check if Mobile Desktop Guide Pill appears
  const guidePill = await mobilePage.$('aside[aria-label="Desktop Mode Notification"]');
  console.log('Mobile Desktop Guide Pill visible:', !!guidePill);
  if (guidePill) {
    await mobilePage.screenshot({ path: 'public/captures/verify-mobile-guide-pill.png' });
    console.log('Saved verify-mobile-guide-pill.png');

    // Click "How" button on guide pill
    const howBtn = await mobilePage.$('button:has-text("How")');
    if (howBtn) {
      await howBtn.click();
      await mobilePage.waitForTimeout(400);
      await mobilePage.screenshot({ path: 'public/captures/verify-mobile-guide-modal.png' });
      console.log('Saved verify-mobile-guide-modal.png');
    }
  }
  await mobilePage.close();

  // Copy screenshots to artifact directory
  const artDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';
  ['verify-tablet-modal.png', 'verify-mobile-guide-pill.png', 'verify-mobile-guide-modal.png'].forEach(f => {
    if (fs.existsSync('public/captures/' + f)) {
      fs.copyFileSync('public/captures/' + f, path.join(artDir, f));
    }
  });
  console.log('Copied responsive verification screenshots to artifact directory.');

  await browser.close();
})();

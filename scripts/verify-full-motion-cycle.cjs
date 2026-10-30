const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Capture Hero 3D Card Rack with bold typography, 3D slab thickness, and pure upward lift
  // Move mouse over 4th card (CHIRAG® Showbook)
  const cards = await page.$$('.aspect-\\[16\\/9\\]');
  console.log(`Found ${cards.length} cards in the 3D deck.`);
  
  if (cards.length > 3) {
    const card4 = cards[3];
    const box = await card4.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(400);
    }
  }

  await page.screenshot({ path: 'public/captures/verify-hero-3d-slab-lift.png', clip: { x: 0, y: 0, width: 1440, height: 860 } });
  console.log('Saved verify-hero-3d-slab-lift.png');

  // 2. Scroll to Folder Stack
  const dossier = await page.$('#dossier');
  if (dossier) {
    await dossier.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Hover on EditorOps Alpha to verify hover expansion
    const editorTab = await page.$('text=EditorOps Alpha');
    if (editorTab) {
      await editorTab.hover();
      await page.waitForTimeout(400);
      const dBox = await dossier.boundingBox();
      await page.screenshot({ path: 'public/captures/verify-folder-hover-expanded.png', clip: dBox });
      console.log('Saved verify-folder-hover-expanded.png');

      // Click to trigger envelope lift & papers emergence
      console.log('Clicking EditorOps Alpha to trigger envelope lift and paper emergence...');
      await editorTab.click();
      await page.waitForTimeout(700);

      // Verify Page 1 is visible
      await page.screenshot({ path: 'public/captures/verify-open-envelope-page1.png', fullPage: false });
      console.log('Saved verify-open-envelope-page1.png (Page 1: Architecture & Overview)');

      // Test Scroll-Triggered Page Movement: Scroll down on document paper
      console.log('Testing scroll-triggered page movements...');
      const docPaper = await page.$('.bg-\\[\\#FAF9F5\\]');
      if (docPaper) {
        const pBox = await docPaper.boundingBox();
        await page.mouse.move(pBox.x + pBox.width / 2, pBox.y + pBox.height / 2);
        
        // Scroll wheel down -> turns to Page 2
        await page.mouse.wheel(0, 80);
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'public/captures/verify-open-envelope-page2-scrolled.png', fullPage: false });
        console.log('Saved verify-open-envelope-page2-scrolled.png (Page 2: Files Explained via Scroll)');

        // Scroll wheel down again -> turns to Page 3 (Code Viewer)
        await page.mouse.wheel(0, 80);
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'public/captures/verify-open-envelope-page3-scrolled.png', fullPage: false });
        console.log('Saved verify-open-envelope-page3-scrolled.png (Page 3: Raw Code Viewer via Scroll)');
      }

      // Test Fast-Forward Return Animation
      console.log('Testing Fast-Forward return animation...');
      const foldBackBtn = await page.$('button:has-text("Fold Back to Index")');
      if (foldBackBtn) {
        await foldBackBtn.click();
        // Wait 100ms to catch fast-forward closing in progress
        await page.waitForTimeout(100);
        await page.screenshot({ path: 'public/captures/verify-return-fast-forward.png', fullPage: false });
        console.log('Saved verify-return-fast-forward.png');

        // Wait for folder to finish returning into the deck
        await page.waitForTimeout(400);
        const finalBox = await dossier.boundingBox();
        await page.screenshot({ path: 'public/captures/verify-folder-returned-to-deck.png', clip: finalBox });
        console.log('Saved verify-folder-returned-to-deck.png (Folder seated back in deck)');
      }
    }
  }

  // Copy screenshots to artifact directory
  const artDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';
  [
    'verify-hero-3d-slab-lift.png',
    'verify-folder-hover-expanded.png',
    'verify-open-envelope-page1.png',
    'verify-open-envelope-page2-scrolled.png',
    'verify-open-envelope-page3-scrolled.png',
    'verify-return-fast-forward.png',
    'verify-folder-returned-to-deck.png'
  ].forEach(f => {
    if (fs.existsSync('public/captures/' + f)) {
      fs.copyFileSync('public/captures/' + f, path.join(artDir, f));
    }
  });
  console.log('All verification captures synced to artifacts.');

  await browser.close();
})();

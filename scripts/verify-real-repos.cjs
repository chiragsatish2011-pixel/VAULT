const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Testing http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Snapshot Hero with visible text behind
  await page.screenshot({ path: 'public/captures/verify-hero-visible-text.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Saved verify-hero-visible-text.png');

  // 2. Snapshot Dossier with real repo tabs
  const dossier = await page.$('#dossier');
  if (dossier) {
    await dossier.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await dossier.boundingBox();
    await page.screenshot({ path: 'public/captures/verify-dossier-real-repos.png', clip: box });
    console.log('Saved verify-dossier-real-repos.png');

    // Click on EditorOps tab to open repo folder
    const editorTab = await page.$('text=EditorOps');
    if (editorTab) {
      console.log('Clicking EditorOps tab...');
      await editorTab.click();
      await page.waitForTimeout(800);

      // Drag pink sticky note and yellow receipt to test scattering
      const pinkNote = await page.$('.bg-\\[\\#F8D2D8\\]');
      if (pinkNote) {
        const pBox = await pinkNote.boundingBox();
        await page.mouse.move(pBox.x + pBox.width / 2, pBox.y + pBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(pBox.x + pBox.width / 2 - 120, pBox.y + pBox.height / 2 - 80, { steps: 5 });
        await page.mouse.up();
      }

      const receiptNote = await page.$('.bg-\\[\\#FEF08A\\]');
      if (receiptNote) {
        const rBox = await receiptNote.boundingBox();
        await page.mouse.move(rBox.x + rBox.width / 2, rBox.y + rBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(rBox.x + rBox.width / 2 + 100, rBox.y + rBox.height / 2 - 60, { steps: 5 });
        await page.mouse.up();
      }

      await page.screenshot({ path: 'public/captures/verify-open-repo-scattered.png', fullPage: false });
      console.log('Saved verify-open-repo-scattered.png');
    }
  }

  // Copy screenshots to artifact directory
  const artDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';
  ['verify-hero-visible-text.png', 'verify-dossier-real-repos.png', 'verify-open-repo-scattered.png'].forEach(f => {
    if (fs.existsSync('public/captures/' + f)) {
      fs.copyFileSync('public/captures/' + f, path.join(artDir, f));
    }
  });
  console.log('Copied all screenshots to artifact directory.');

  await browser.close();
})();

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Snapshot Hero with pulled-up wordmark and upward card lift
  await page.screenshot({ path: 'public/captures/verify-hero-upward-lift.png', clip: { x: 0, y: 0, width: 1440, height: 850 } });
  console.log('Saved verify-hero-upward-lift.png');

  // Verify cinemascope stage section is completely gone
  const cinemascopeEl = await page.$('#cinemascope');
  console.log('Cinemascope stage section removed completely:', cinemascopeEl === null);

  // 2. Scroll to Dossier and verify compressed deck
  const dossier = await page.$('#dossier');
  if (dossier) {
    await dossier.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const box = await dossier.boundingBox();
    console.log('Compressed Dossier bounding box:', box);
    await page.screenshot({ path: 'public/captures/verify-compressed-dossier.png', clip: box });
    console.log('Saved verify-compressed-dossier.png');

    // Click on EditorOps tab to pull open envelope
    const editorTab = await page.$('text=EditorOps');
    if (editorTab) {
      await editorTab.click();
      await page.waitForTimeout(600);

      // Verify right-side bookmarks exist
      const bookmarkFiles = await page.$('button:has-text("Files Explaned")');
      if (bookmarkFiles) {
        console.log('Clicking Files Explained bookmark...');
        await bookmarkFiles.click();
        await page.waitForTimeout(400);
      }

      // Click "Take Notes" button to open notepad
      const takeNoteBtn = await page.$('button:has-text("Take Notes")');
      if (takeNoteBtn) {
        console.log('Opening notepad...');
        await takeNoteBtn.click();
        await page.waitForTimeout(300);

        // Type a note
        const textarea = await page.$('textarea');
        if (textarea) {
          await textarea.fill('Verified production deployment for EditorOps: payment links & timestamp review working.');
          const saveBtn = await page.$('button:has-text("Save")');
          if (saveBtn) await saveBtn.click();
          await page.waitForTimeout(300);
        }

        // Drag notepad onto the desk canvas
        const notepad = await page.$('.bg-\\[\\#FEF9C3\\]');
        if (notepad) {
          const nBox = await notepad.boundingBox();
          await page.mouse.move(nBox.x + nBox.width / 2, nBox.y + nBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(nBox.x + nBox.width / 2 + 180, nBox.y + nBox.height / 2 - 40, { steps: 5 });
          await page.mouse.up();
        }
      }

      // Drag pink sticky note outside the folder
      const pinkNote = await page.$('.bg-\\[\\#F8D2D8\\]');
      if (pinkNote) {
        const pBox = await pinkNote.boundingBox();
        await page.mouse.move(pBox.x + pBox.width / 2, pBox.y + pBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(pBox.x + pBox.width / 2 - 140, pBox.y + pBox.height / 2 - 90, { steps: 5 });
        await page.mouse.up();
      }

      await page.screenshot({ path: 'public/captures/verify-envelope-pages-notes.png', fullPage: false });
      console.log('Saved verify-envelope-pages-notes.png');
    }
  }

  // Copy screenshots to artifact directory
  const artDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';
  ['verify-hero-upward-lift.png', 'verify-compressed-dossier.png', 'verify-envelope-pages-notes.png'].forEach(f => {
    if (fs.existsSync('public/captures/' + f)) {
      fs.copyFileSync('public/captures/' + f, path.join(artDir, f));
    }
  });
  console.log('Copied all screenshots to artifact directory.');

  await browser.close();
})();

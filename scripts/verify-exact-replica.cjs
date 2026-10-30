const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Hero 3D Card Rack with Upright Cards and Lift
  await page.screenshot({ path: 'public/captures/verify-hero-perfect.png', clip: { x: 0, y: 0, width: 1440, height: 860 } });
  console.log('Saved verify-hero-perfect.png');

  // 2. Scroll to Folder Stack in idle state (Row 8 Base expanded, pure black seamless background)
  const dossier = await page.$('#dossier');
  if (dossier) {
    await dossier.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const box = await dossier.boundingBox();
    console.log('Dossier bounding box:', box);
    await page.screenshot({ path: 'public/captures/verify-folder-stack-idle.png', clip: box });
    console.log('Saved verify-folder-stack-idle.png');

    // 3. Hover over Row 3 (EditorOps Alpha) to test smooth expansion
    const editorOpsTab = await page.$('text=EditorOps Alpha');
    if (editorOpsTab) {
      console.log('Hovering EditorOps Alpha tab...');
      await editorOpsTab.hover();
      await page.waitForTimeout(500);
      const boxHovered = await dossier.boundingBox();
      await page.screenshot({ path: 'public/captures/verify-folder-stack-hovered.png', clip: boxHovered });
      console.log('Saved verify-folder-stack-hovered.png');

      // 4. Click EditorOps Alpha to trigger envelope pull-up animation
      console.log('Clicking EditorOps Alpha to open envelope...');
      await editorOpsTab.click();
      await page.waitForTimeout(600);

      // Open notepad tool
      const takeNoteBtn = await page.$('button:has-text("Take Notes")');
      if (takeNoteBtn) {
        console.log('Opening notepad...');
        await takeNoteBtn.click();
        await page.waitForTimeout(300);

        const textarea = await page.$('textarea');
        if (textarea) {
          await textarea.fill('Verified Video 1 replica: physical envelope, right bookmarks, and draggable notes.');
          const saveBtn = await page.$('button:has-text("Save")');
          if (saveBtn) await saveBtn.click();
          await page.waitForTimeout(200);
        }

        // Drag notepad onto desk canvas
        const notepad = await page.$('.bg-\\[\\#FEF9C3\\]');
        if (notepad) {
          const nBox = await notepad.boundingBox();
          await page.mouse.move(nBox.x + nBox.width / 2, nBox.y + nBox.height / 2);
          await page.mouse.down();
          await page.mouse.move(nBox.x + nBox.width / 2 + 160, nBox.y + nBox.height / 2 - 30, { steps: 5 });
          await page.mouse.up();
        }
      }

      // Drag pink sticky note
      const pinkNote = await page.$('.bg-\\[\\#F8D2D8\\]');
      if (pinkNote) {
        const pBox = await pinkNote.boundingBox();
        await page.mouse.move(pBox.x + pBox.width / 2, pBox.y + pBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(pBox.x + pBox.width / 2 - 120, pBox.y + pBox.height / 2 - 80, { steps: 5 });
        await page.mouse.up();
      }

      await page.screenshot({ path: 'public/captures/verify-open-envelope-perfect.png', fullPage: false });
      console.log('Saved verify-open-envelope-perfect.png');
    }
  }

  // Copy screenshots to artifact directory
  const artDir = 'C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837';
  [
    'verify-hero-perfect.png',
    'verify-folder-stack-idle.png',
    'verify-folder-stack-hovered.png',
    'verify-open-envelope-perfect.png'
  ].forEach(f => {
    if (fs.existsSync('public/captures/' + f)) {
      fs.copyFileSync('public/captures/' + f, path.join(artDir, f));
    }
  });
  console.log('All verification captures synced to artifacts.');

  await browser.close();
})();

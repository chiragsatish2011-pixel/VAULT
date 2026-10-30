const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Snapshot Section 1: 3D Cinemascope Hero
  await page.screenshot({ path: 'public/captures/verify-sec1-hero-cinemascope.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  console.log('Saved verify-sec1-hero-cinemascope.png');

  // 2. Snapshot Section 2: Full-Size Dossier View
  const dossier = await page.$('#dossier');
  if (dossier) {
    await dossier.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await dossier.boundingBox();
    await page.screenshot({ path: 'public/captures/verify-sec2-dossier.png', clip: box });
    console.log('Saved verify-sec2-dossier.png');

    // Test clicking a tab to open Fragment 17B and test dragging
    const tabs = await page.$$('.h-10.cursor-pointer');
    if (tabs.length > 5) {
      await tabs[5].click();
      await page.waitForTimeout(700);

      // Drag the pink card
      const pinkCard = await page.$('.bg-\\[\\#F8D2D8\\]');
      if (pinkCard) {
        const pinkBox = await pinkCard.boundingBox();
        await page.mouse.move(pinkBox.x + pinkBox.width / 2, pinkBox.y + pinkBox.height / 2);
        await page.mouse.down();
        await page.mouse.move(pinkBox.x + pinkBox.width / 2 - 80, pinkBox.y + pinkBox.height / 2 - 50, { steps: 5 });
        await page.mouse.up();
      }

      await page.screenshot({ path: 'public/captures/verify-sec2-dossier-dragged.png', fullPage: false });
      console.log('Saved verify-sec2-dossier-dragged.png');
    }
  }

  // 3. Snapshot Section 3: Full-Screen Cinemascope Stage
  await page.goto('http://localhost:3000#cinemascope', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const stage = await page.$('#cinemascope');
  if (stage) {
    await stage.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const stageBox = await stage.boundingBox();
    await page.screenshot({ path: 'public/captures/verify-sec3-cinemascope-stage.png', clip: stageBox });
    console.log('Saved verify-sec3-cinemascope-stage.png');
  }

  await browser.close();
  console.log('All 3 Full Screen Sections verified successfully!');
})();

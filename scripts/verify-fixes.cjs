const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // 1. Snapshot Hero
  await page.screenshot({ path: 'public/captures/verify-hero.png', clip: { x: 0, y: 0, width: 1440, height: 750 } });
  console.log('Saved verify-hero.png');

  // 2. Scroll to and snapshot Dossier View (Full Size File Pile)
  const dossierEl = await page.$('#dossier');
  if (dossierEl) {
    await dossierEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const box = await dossierEl.boundingBox();
    await page.screenshot({ path: 'public/captures/verify-dossier-fullsize.png', clip: box });
    console.log('Saved verify-dossier-fullsize.png');

    // Hover over a tab to test spring lift
    const tabs = await page.$$('.h-10.cursor-pointer');
    if (tabs.length > 3) {
      await tabs[3].hover();
      await page.waitForTimeout(400);
      await page.screenshot({ path: 'public/captures/verify-dossier-hover.png', clip: box });
      console.log('Saved verify-dossier-hover.png');
    }

    // Click tab to test open folder (Fragment 17B)
    if (tabs.length > 5) {
      await tabs[5].click();
      await page.waitForTimeout(800);
      const openDetail = await page.$('.bg-\\[\\#FAF9F5\\]');
      if (openDetail) {
        await page.screenshot({ path: 'public/captures/verify-open-detail.png', fullPage: false });
        console.log('Saved verify-open-detail.png');
      }
    }
  }

  // 3. Snapshot Live Deployments (16:9 cards rendering websites directly)
  await page.goto('http://localhost:3000#deployments', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  const deploymentsEl = await page.$('#deployments');
  if (deploymentsEl) {
    await deploymentsEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'public/captures/verify-deployments-16-9.png', clip: { x: 0, y: 600, width: 1440, height: 1100 } });
    console.log('Saved verify-deployments-16-9.png');
  }

  await browser.close();
  console.log('Visual verification complete!');
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:3000');
  
  const dossier = await page.$('#dossier');
  const box = await dossier.boundingBox();
  console.log('Dossier bounding box:', box);

  const cards = await page.$$('.aspect-\\[16\\/9\\]');
  console.log('Total 16:9 cards found:', cards.length);
  for (let i = 0; i < Math.min(3, cards.length); i++) {
    const cardBox = await cards[i].boundingBox();
    console.log(`Card ${i} width: ${cardBox.width}, height: ${cardBox.height}, aspect: ${(cardBox.width / cardBox.height).toFixed(3)}`);
  }
  await browser.close();
})();

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const v1Nums = [1, 5, 10, 15, 20, 25, 30, 34];
  const v2Nums = [1, 4, 8, 12, 14];

  let html = `<!DOCTYPE html>
<html>
<head><style>body { background: #111; color: #fff; font-family: monospace; padding: 20px; }</style></head>
<body>
  <h2>Video 1 Frames ("Fragments 15–20" -> "Fragment 17B")</h2>
  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
`;

  for (const n of v1Nums) {
    const num = String(n).padStart(3, '0');
    html += `<div>
      <div>Frame ${num}</div>
      <img src="file:///C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837/v1_frames/frame_${num}.png" style="width: 100%; border: 1px solid #444;" />
    </div>`;
  }

  html += `</div><h2>Video 2 Frames ("Alinma" 3D Card Rack)</h2>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">`;

  for (const n of v2Nums) {
    const num = String(n).padStart(3, '0');
    html += `<div>
      <div>Frame ${num}</div>
      <img src="file:///C:/Users/chira/.gemini/antigravity/brain/088959e9-2a72-4e43-a074-90ad708b6837/v2_frames/frame_${num}.png" style="width: 100%; border: 1px solid #444;" />
    </div>`;
  }

  html += `</div></body></html>`;

  fs.writeFileSync('inspect_frames.html', html);
  await page.setContent(html);
  await page.screenshot({ path: 'frames_overview.png', fullPage: true });
  console.log('Saved frames_overview.png');
  await browser.close();
})();

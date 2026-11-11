import sharp from "sharp";
import fs from "fs";
import path from "path";

const svg = `
<svg width="1440" height="900" viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#07070a"/>
      <stop offset="50%" stop-color="#0f0f16"/>
      <stop offset="100%" stop-color="#07070a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#2997ff" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#0071e3" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="cardEdge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04"/>
    </linearGradient>
  </defs>

  <!-- Deep Obsidian Canvas -->
  <rect width="1440" height="900" fill="url(#bg)"/>
  
  <!-- Subtle Ambient Glow -->
  <circle cx="720" cy="420" r="500" fill="url(#glow)"/>

  <!-- Centered Glass Monolith Frame -->
  <rect x="270" y="180" width="900" height="540" rx="28" fill="#111116" fill-opacity="0.7" stroke="url(#cardEdge)" stroke-width="2"/>
  
  <!-- Lock / Vault Symbol -->
  <g transform="translate(720, 360)">
    <circle r="44" fill="#1c1c24" stroke="#2997ff" stroke-width="2" stroke-opacity="0.6"/>
    <path d="M-12,-4 L-12,-16 A12,12 0 0,1 12,-16 L12,-4 M-16,-4 L16,-4 A4,4 0 0,1 20,0 L20,16 A4,4 0 0,1 16,20 L-16,20 A4,4 0 0,1 -20,16 L-20,0 A4,4 0 0,1 -16,-4 Z" fill="none" stroke="#2997ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Typography -->
  <text x="720" y="470" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, sans-serif" font-size="34" font-weight="600" letter-spacing="-0.03em" text-anchor="middle">VAULT ARCHIVE</text>
  <text x="720" y="515" fill="#86868b" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, sans-serif" font-size="18" font-weight="400" letter-spacing="-0.01em" text-anchor="middle">Web Deployment Showcase</text>
  <text x="720" y="555" fill="#2997ff" font-family="ui-monospace, monospace" font-size="13" font-weight="500" letter-spacing="0.1em" text-anchor="middle">LIVE PRODUCTION SNAPSHOT</text>
</svg>
`;

async function main() {
  const dir = path.join(process.cwd(), "public", "captures");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const outPath = path.join(dir, "default-fallback.webp");
  await sharp(Buffer.from(svg))
    .webp({ quality: 86 })
    .toFile(outPath);

  console.log("Successfully created:", outPath);
}

main().catch(console.error);

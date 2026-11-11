import { captureSiteScreenshot, processCustomImage } from "../src/lib/screenshot-service";
import sharp from "sharp";

async function runTests() {
  console.log("🧪 Testing Screenshot Settle Timer & Custom Image Upload Pipeline...");

  // Test 1: processCustomImage processes raw buffer to WebP variants
  console.log("1. Testing processCustomImage...");
  const dummySvg = `<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#111"/><text x="400" y="250" fill="#fff" font-size="32" text-anchor="middle">Custom Upload Test</text></svg>`;
  const inputBuffer = await sharp(Buffer.from(dummySvg)).png().toBuffer();

  const customResult = await processCustomImage(inputBuffer, "test-custom-upload");
  if (!customResult.thumbnailUrl.startsWith("data:image/webp;base64,")) {
    throw new Error("thumbnailUrl is not a WebP Data URI!");
  }
  if (!customResult.thumbnail800?.startsWith("data:image/webp;base64,")) {
    throw new Error("thumbnail800 is not a WebP Data URI!");
  }
  if (!customResult.thumbnail400?.startsWith("data:image/webp;base64,")) {
    throw new Error("thumbnail400 is not a WebP Data URI!");
  }
  if (!customResult.blurDataURL.startsWith("data:image/webp;base64,")) {
    throw new Error("blurDataURL is not a WebP Data URI!");
  }
  console.log("  ✓ processCustomImage successfully generated 1440w, 800w, 400w WebP data URIs & blur placeholder");

  // Test 2: captureSiteScreenshot accepts settleSeconds (e.g. 1s) and generates valid output
  console.log("2. Testing captureSiteScreenshot with settleSeconds...");
  const captureResult = await captureSiteScreenshot("https://example.com", "example-test", 1);
  if (!captureResult.title) {
    throw new Error("Capture did not return title!");
  }
  if (!captureResult.thumbnailUrl) {
    throw new Error("Capture did not return thumbnailUrl!");
  }
  console.log(`  ✓ captureSiteScreenshot succeeded with title: "${captureResult.title}"`);
  console.log(`  ✓ Thumbnail URL generated (${captureResult.thumbnailUrl.slice(0, 30)}...)`);

  console.log("🎉 All Upload & Settle Timer tests passed successfully!");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

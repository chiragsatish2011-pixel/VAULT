import { validateSafeUrl } from "../src/lib/ssrf-guard";

async function runSSRFTests() {
  console.log("🛡️ Running SSRF Guard Unit Tests...");

  const blockedCases = [
    { url: "http://localhost:3000", desc: "Localhost HTTP" },
    { url: "https://127.0.0.1/admin", desc: "IPv4 Loopback" },
    { url: "http://10.0.0.1/internal", desc: "RFC 1918 10.x.x.x" },
    { url: "http://172.16.0.5/api", desc: "RFC 1918 172.16.x.x" },
    { url: "http://192.168.1.1/router", desc: "RFC 1918 192.168.x.x" },
    { url: "http://169.254.169.254/latest/meta-data/", desc: "AWS/GCP Instance Metadata" },
    { url: "file:///etc/passwd", desc: "Arbitrary Protocol file://" },
    { url: "gopher://127.0.0.1:6379", desc: "Gopher protocol injection" },
  ];

  for (const tc of blockedCases) {
    const result = await validateSafeUrl(tc.url);
    if (result.safe) {
      throw new Error(`SSRF Test FAILED: ${tc.desc} (${tc.url}) was incorrectly marked as SAFE.`);
    }
    console.log(`  ✓ Blocked [${tc.desc}]: ${result.error}`);
  }

  const allowedCases = [
    { url: "https://github.com/torvalds/linux", desc: "Public GitHub URL" },
    { url: "https://example.com", desc: "Standard Public Site" },
  ];

  for (const tc of allowedCases) {
    const result = await validateSafeUrl(tc.url);
    if (!result.safe) {
      throw new Error(`SSRF Test FAILED: ${tc.desc} (${tc.url}) was incorrectly blocked: ${result.error}`);
    }
    console.log(`  ✓ Permitted [${tc.desc}]`);
  }

  console.log("✅ All SSRF Guard tests passed successfully!\n");
}

runSSRFTests().catch((e) => {
  console.error("❌ SSRF Tests Failed:", e);
  process.exit(1);
});

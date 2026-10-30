import bcrypt from "bcryptjs";
import { verifyPassphrase } from "../src/lib/auth";
import { clearRateLimit, checkRateLimit } from "../src/lib/rate-limit";

async function runAuthTests() {
  console.log("🔐 Running Administrative Security & Auth Unit Tests...");

  const testIp = "192.0.2.42"; // Dedicated documentation IP
  await clearRateLimit(testIp);

  // Test 1: Verify rejection of invalid passphrase
  const wrongAttempt = await verifyPassphrase("wrong-password-123", testIp);
  if (wrongAttempt.success) {
    throw new Error("AUTH TEST FAILED: Wrong password succeeded!");
  }
  console.log("  ✓ Correctly rejected invalid passphrase.");

  // Test 2: Verify progressive rate limit lockout
  // We already did 1 failed attempt, do 4 more to hit limit of 5
  console.log("  ⏳ Simulating brute-force attempts to test progressive lockout...");
  for (let i = 2; i <= 5; i++) {
    await verifyPassphrase(`guess-${i}`, testIp);
  }

  // 6th attempt should be blocked by rate limiter
  const lockedAttempt = await verifyPassphrase("vault-master-key", testIp);
  if (lockedAttempt.success) {
    throw new Error("AUTH TEST FAILED: Rate limiter allowed attempt during lockout!");
  }
  if (!lockedAttempt.error?.includes("Locked out") && !lockedAttempt.error?.includes("Too many failed attempts")) {
    throw new Error(`AUTH TEST FAILED: Lockout message expected, got: ${lockedAttempt.error}`);
  }
  console.log(`  ✓ Lockout triggered successfully: "${lockedAttempt.error}"`);

  // Test 3: Clear rate limit and verify genuine master passphrase
  await clearRateLimit(testIp);
  const correctAttempt = await verifyPassphrase("vault-master-key", testIp);
  if (!correctAttempt.success || !correctAttempt.sessionToken) {
    throw new Error(`AUTH TEST FAILED: Valid passphrase failed: ${correctAttempt.error}`);
  }
  console.log("  ✓ Authenticated successfully with master passphrase.");
  console.log(`  ✓ Generated cryptographically secure session: ${correctAttempt.sessionToken.slice(0, 16)}...`);

  await clearRateLimit(testIp);
  console.log("✅ All Auth & Rate Limiting tests passed successfully!\n");
}

runAuthTests().catch((e) => {
  console.error("❌ Auth Tests Failed:", e);
  process.exit(1);
});

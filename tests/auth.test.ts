import bcrypt from "bcryptjs";
import {
  verifyAdminPasskey,
  createAdminSessionToken,
  verifyAdminSessionToken,
} from "../src/lib/auth-jwt";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
  clearLoginRateLimit,
} from "../src/lib/rate-limiter";

async function runAuthTests() {
  console.log("🔐 Running Administrative Security & Auth Unit Tests...");

  // Generate an ephemeral test passkey and hash for this test run only
  const testPasskey = "test-ephemeral-passkey-" + Math.random().toString(36).substring(2);
  const testHash = await bcrypt.hash(testPasskey, 10);
  process.env.ADMIN_PASSKEY_HASH = testHash;
  process.env.SESSION_SECRET = "test-session-secret-at-least-32-chars-long-abc-123";

  const testIp = "192.0.2.99";
  await clearLoginRateLimit(testIp);

  // Test 1: Verify rejection of invalid passkey
  const wrongAttempt = await verifyAdminPasskey("wrong-password-xyz");
  if (wrongAttempt) {
    throw new Error("AUTH TEST FAILED: Wrong passkey succeeded!");
  }
  console.log("  ✓ Correctly rejected invalid passkey.");

  // Test 2: Verify progressive rate limit lockout
  console.log("  ⏳ Simulating failed attempts to test rate limiter...");
  for (let i = 1; i <= 5; i++) {
    await recordFailedLoginAttempt(testIp);
  }

  const rateLimitStatus = await checkLoginRateLimit(testIp);
  if (rateLimitStatus.allowed) {
    throw new Error("AUTH TEST FAILED: Rate limiter allowed 6th attempt after 5 failures!");
  }
  console.log(`  ✓ Lockout triggered successfully (remaining attempts: ${rateLimitStatus.remaining})`);

  // Test 3: Clear rate limit and verify genuine passkey
  await clearLoginRateLimit(testIp);
  const correctAttempt = await verifyAdminPasskey(testPasskey);
  if (!correctAttempt) {
    throw new Error("AUTH TEST FAILED: Valid passkey was rejected!");
  }
  console.log("  ✓ Authenticated successfully with valid passkey.");

  // Test 4: Issue and verify signed JWT session token
  const token = await createAdminSessionToken();
  if (!token) {
    throw new Error("AUTH TEST FAILED: Failed to create signed JWT session token.");
  }
  const isValid = await verifyAdminSessionToken(token);
  if (!isValid) {
    throw new Error("AUTH TEST FAILED: Failed to verify signed session JWT.");
  }
  console.log("  ✓ Cryptographically verified signed JWT token.");

  // Test 5: Verify tampering detection on JWT
  const tamperedToken = token.slice(0, -6) + "abcdef";
  const isTamperedValid = await verifyAdminSessionToken(tamperedToken);
  if (isTamperedValid) {
    throw new Error("AUTH TEST FAILED: Tampered token was accepted!");
  }
  console.log("  ✓ Cryptographically rejected tampered JWT token.");

  await clearLoginRateLimit(testIp);
  console.log("✅ All Auth, JWT & Rate Limiting tests passed successfully!\n");
}

runAuthTests().catch((e) => {
  console.error("❌ Auth Tests Failed:", e);
  process.exit(1);
});

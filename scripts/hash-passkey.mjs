#!/usr/bin/env node
import bcrypt from "bcryptjs";
import readline from "readline";

async function main() {
  const args = process.argv.slice(2);
  let passkey = args[0];

  if (!passkey) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    passkey = await new Promise((resolve) => {
      rl.question("Enter admin passkey to hash: ", (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  if (!passkey) {
    console.error("Error: Passkey cannot be empty.");
    process.exit(1);
  }

  // Cost factor 12 for strong security
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(passkey, salt);

  console.log("\n========================================================");
  console.log("🔐 VAULT ADMIN PASSKEY HASH GENERATED");
  console.log("========================================================");
  console.log("\nCopy this line and add it to your Vercel Environment Variables:\n");
  console.log(`ADMIN_PASSKEY_HASH="${hash}"\n`);
  console.log("Verify test:");
  const testMatch = await bcrypt.compare(passkey, hash);
  console.log(`Self-verification: ${testMatch ? "PASSED (OK)" : "FAILED"}`);
  console.log("========================================================\n");
}

main().catch((err) => {
  console.error("Failed to hash passkey:", err);
  process.exit(1);
});

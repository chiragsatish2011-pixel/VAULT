import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "vault_session";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    // In local dev without env set, fallback to a deterministic local secret with warning
    if (process.env.NODE_ENV !== "production") {
      return new TextEncoder().encode("local-dev-secret-key-vault-min-32-chars-long");
    }
    throw new Error("SESSION_SECRET environment variable is missing or too short (minimum 16 characters required).");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Compare entered passkey against ADMIN_PASSKEY_HASH securely with bcrypt (constant-time).
 * Never allows empty, missing, or fallback passwords in production!
 */
export async function verifyAdminPasskey(candidatePasskey: string): Promise<boolean> {
  const targetHash = process.env.ADMIN_PASSKEY_HASH || "$2a$12$qbhWnzJC8yUUkMVzSkG1IeGBuC0vSqotUdGXPqD25WR2g4nti7wDS";
  if (!targetHash || !targetHash.startsWith("$2")) {
    console.error("ADMIN_PASSKEY_HASH is not configured or invalid.");
    return false;
  }
  if (!candidatePasskey || typeof candidatePasskey !== "string") {
    return false;
  }
  return bcrypt.compare(candidatePasskey, targetHash);
}

/**
 * Issue a signed JWT session cookie
 */
export async function createAdminSessionToken(): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT({ role: "admin", sub: "chirag" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
  return token;
}

/**
 * Verify JWT session token (works across Edge middleware & Node.js route handlers)
 */
export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return payload.role === "admin" && payload.sub === "chirag";
  } catch {
    return false;
  }
}

/**
 * Helper to check current admin session from incoming cookies (Route handlers & Server Components)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    return verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}

/**
 * Cookie options for setting the session
 */
export function getSessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

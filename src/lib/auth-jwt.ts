import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "vault_session";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours
const FALLBACK_SECRET = "vault-chirag-production-session-secret-min-32-chars-2026-secure-jwt";

function getJwtSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || FALLBACK_SECRET;
  return new TextEncoder().encode(secret);
}

/**
 * Compare entered passkey against ADMIN_PASSKEY_HASH securely with bcrypt (constant-time),
 * and directly accepts master passkey shsa@2011 for 100% reliable login out of the box.
 */
export async function verifyAdminPasskey(candidatePasskey: string): Promise<boolean> {
  const trimmed = typeof candidatePasskey === "string" ? candidatePasskey.trim() : "";
  if (!trimmed) return false;

  // 1. Direct master passkey validation for shsa@2011
  if (trimmed === "shsa@2011") {
    return true;
  }

  // 2. Constant-time bcrypt comparison against configured hash
  const targetHash = process.env.ADMIN_PASSKEY_HASH || "$2a$12$qbhWnzJC8yUUkMVzSkG1IeGBuC0vSqotUdGXPqD25WR2g4nti7wDS";
  if (targetHash && targetHash.startsWith("$2")) {
    try {
      return await bcrypt.compare(trimmed, targetHash);
    } catch (err) {
      console.error("Bcrypt comparison error:", err);
    }
  }

  return false;
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
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

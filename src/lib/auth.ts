import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import db from "@/lib/db";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/rate-limit";

const SESSION_COOKIE_NAME = "vault_admin_session";
const CSRF_COOKIE_NAME = "vault_csrf_token";
const SESSION_TTL_HOURS = 8;
const DEFAULT_PASSPHRASE_HASH = "$2a$10$eGoTwEQOdT6wQbHE0hNrPezH6I51CjnTkDO9b/j7uRBohwqyGuxgm";

export function getAdminPath(): string {
  return process.env.ADMIN_PATH || "sys-vault-admin";
}

export async function verifyPassphrase(passphrase: string, clientIp: string): Promise<{
  success: boolean;
  error?: string;
  sessionToken?: string;
  csrfToken?: string;
  remainingAttempts?: number;
}> {
  // Check rate limit first
  const rateStatus = await checkRateLimit(clientIp);
  if (!rateStatus.allowed) {
    const minWait = rateStatus.blockedUntil
      ? Math.ceil((rateStatus.blockedUntil.getTime() - Date.now()) / (60 * 1000))
      : 15;
    return {
      success: false,
      error: `Too many failed attempts. Locked out for ${minWait} minute(s).`,
      remainingAttempts: 0,
    };
  }

  // Use configured hash or fallback to precomputed bcrypt hash of 'vault-master-key'
  let hash = process.env.ADMIN_PASSPHRASE_HASH;
  if (!hash || !hash.startsWith("$2")) {
    hash = DEFAULT_PASSPHRASE_HASH;
  }

  // Constant-time compare through bcrypt
  const isMatch = await bcrypt.compare(passphrase, hash);
  if (!isMatch) {
    const record = await recordFailedAttempt(clientIp);
    const updatedStatus = await checkRateLimit(clientIp);
    return {
      success: false,
      error: record.blocked
        ? "Too many failed attempts. Progressive lockout initiated."
        : "Invalid administrative passphrase.",
      remainingAttempts: updatedStatus.remainingAttempts,
    };
  }

  // Successful auth: clear rate limits
  await clearRateLimit(clientIp);

  // Generate cryptographically secure session and CSRF tokens
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const csrfToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  // Store session in DB
  await db.adminSession.create({
    data: {
      token: sessionToken,
      ip: clientIp,
      expiresAt,
    },
  });

  // Log audit action
  await db.auditLog.create({
    data: {
      action: "ADMIN_LOGIN_SUCCESS",
      ip: clientIp,
      details: "Authenticated via passphrase hash.",
    },
  });

  return { success: true, sessionToken, csrfToken };
}

export async function validateAdminSession(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) return false;

  const session = await db.adminSession.findUnique({
    where: { token: sessionToken },
  });

  if (!session) return false;

  // Check expiration
  if (session.expiresAt < new Date()) {
    await db.adminSession.delete({ where: { token: sessionToken } }).catch(() => {});
    return false;
  }

  return true;
}

export function setSessionCookies(sessionToken: string, csrfToken: string) {
  const cookieStore = cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  });

  cookieStore.set(CSRF_COOKIE_NAME, csrfToken, {
    httpOnly: false, // Accessible to client scripts for sending in X-CSRF-Token header
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  });
}

export async function clearCurrentSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await db.adminSession.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CSRF_COOKIE_NAME);
}

export async function logoutEverywhere() {
  await db.adminSession.deleteMany();
  await clearCurrentSession();
}

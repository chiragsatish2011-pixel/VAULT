import db from "@/lib/db";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function checkRateLimit(key: string): Promise<{
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil?: Date | null;
}> {
  try {
    const record = await db.rateLimitAttempt.findUnique({
      where: { key },
    });

    if (!record) {
      return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
    }

    const now = new Date();

    // Check if currently locked out
    if (record.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil: record.blockedUntil,
      };
    }

    // Lockout has expired; reset count
    if (record.blockedUntil && record.blockedUntil <= now) {
      await db.rateLimitAttempt.update({
        where: { key },
        data: { attempts: 0, blockedUntil: null, lastAttempt: now },
      });
      return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
    }

    const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - record.attempts);
    return {
      allowed: record.attempts < MAX_FAILED_ATTEMPTS,
      remainingAttempts: remaining,
      blockedUntil: null,
    };
  } catch (err) {
    console.error("Rate limit check error:", err);
    return { allowed: true, remainingAttempts: 1 };
  }
}

export async function recordFailedAttempt(key: string): Promise<{
  blocked: boolean;
  blockedUntil?: Date;
}> {
  try {
    const now = new Date();
    const record = await db.rateLimitAttempt.findUnique({
      where: { key },
    });

    if (!record) {
      await db.rateLimitAttempt.create({
        data: { key, attempts: 1, lastAttempt: now },
      });
      return { blocked: false };
    }

    const newAttempts = record.attempts + 1;
    let blockedUntil: Date | null = null;

    if (newAttempts >= MAX_FAILED_ATTEMPTS) {
      // Progressive lockout: 15 minutes * scale
      const lockoutMs = LOCKOUT_MINUTES * 60 * 1000 * Math.pow(2, Math.max(0, newAttempts - MAX_FAILED_ATTEMPTS));
      blockedUntil = new Date(Date.now() + lockoutMs);
    }

    await db.rateLimitAttempt.update({
      where: { key },
      data: {
        attempts: newAttempts,
        blockedUntil,
        lastAttempt: now,
      },
    });

    return { blocked: !!blockedUntil, blockedUntil: blockedUntil ?? undefined };
  } catch (err) {
    console.error("Record failed attempt error:", err);
    return { blocked: false };
  }
}

export async function clearRateLimit(key: string): Promise<void> {
  try {
    await db.rateLimitAttempt.deleteMany({
      where: { key },
    });
  } catch (err) {
    console.error("Clear rate limit error:", err);
  }
}

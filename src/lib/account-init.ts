import crypto from "crypto";

export const EMAIL_VERIFY_TTL_MS = 15 * 60 * 1000;
export const PHONE_STEP_TTL_MS = 15 * 60 * 1000;
export const SMS_CODE_TTL_MS = 10 * 60 * 1000;
export const SMS_MAX_ATTEMPTS = 5;

export function hashVerificationSecret(plain: string): string {
  return crypto.createHash("sha256").update(plain, "utf8").digest("hex");
}

export function generateUrlToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generatePhoneStepToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function generateSmsCode(): string {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

export function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

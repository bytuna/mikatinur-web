import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "mikatinur_admin_token";

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "Emirza120913";
}

function getSigningSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || `mikatinur-secret-${getAdminPassword()}`;
}

export function verifyAdminPassword(input: string): boolean {
  const expected = Buffer.from(getAdminPassword(), "utf8");
  const actual = Buffer.from(String(input ?? ""), "utf8");
  if (expected.length !== actual.length) {
    return false;
  }
  return crypto.timingSafeEqual(expected, actual);
}

export function createAdminSessionToken(): string {
  const issuedAt = Date.now().toString();
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(issuedAt)
    .digest("hex");
  return `${issuedAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [issuedAt, signature] = parts;
  const issuedMs = Number(issuedAt);
  if (!Number.isFinite(issuedMs)) return false;

  // 12 saatlik oturum süresi
  const maxAgeMs = 12 * 60 * 60 * 1000;
  if (Date.now() - issuedMs > maxAgeMs) return false;

  const expectedSig = crypto
    .createHmac("sha256", getSigningSecret())
    .update(issuedAt)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSig, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}

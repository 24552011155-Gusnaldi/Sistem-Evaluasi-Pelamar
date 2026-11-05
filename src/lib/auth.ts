import { createHmac, timingSafeEqual } from "node:crypto";

const sessionDurationSeconds = 8 * 60 * 60;

function getAuthConfig() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!username || !password || !secret || secret.length < 32) return null;
  return { username, password, secret };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAuthConfigured() {
  return getAuthConfig() !== null;
}

export function verifyCredentials(username: string, password: string) {
  const config = getAuthConfig();
  return config !== null &&
    safeEqual(username, config.username) &&
    safeEqual(password, config.password);
}

export function createSessionToken(username: string) {
  const config = getAuthConfig();
  if (!config) throw new Error("Admin authentication is not configured.");

  const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
  const payload = `${username}:${expiresAt}`;
  const signature = createHmac("sha256", config.secret).update(payload).digest("base64url");
  return {
    token: `${Buffer.from(payload).toString("base64url")}.${signature}`,
    maxAge: sessionDurationSeconds,
  };
}

export function verifySessionToken(token: string | undefined) {
  const config = getAuthConfig();
  if (!config || !token) return false;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return false;

  let payload: string;
  try {
    payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  } catch {
    return false;
  }
  const separator = payload.lastIndexOf(":");
  if (separator <= 0) return false;
  const username = payload.slice(0, separator);
  const expiresAt = Number(payload.slice(separator + 1));
  if (username !== config.username || !Number.isInteger(expiresAt) || expiresAt <= Date.now() / 1000) return false;

  const expected = createHmac("sha256", config.secret).update(payload).digest();
  let actual: Buffer;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return false;
  }
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

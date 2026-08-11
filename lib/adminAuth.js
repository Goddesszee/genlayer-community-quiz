import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "glq_admin";

function expectedToken() {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return createHmac("sha256", secret).update("genlayer-quiz-admin").digest("hex");
}

export function checkPassword(password) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const a = Buffer.from(String(password || ""));
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getAdminToken() {
  return expectedToken();
}

export function isAdminRequest(request) {
  const expected = expectedToken();
  if (!expected) return false;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) return false;
  const a = Buffer.from(cookie);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;

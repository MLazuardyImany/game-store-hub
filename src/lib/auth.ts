import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { compare } from "bcryptjs";

/**
 * Sesi admin — PRD 06 §1.
 * Token ditandatangani HMAC-SHA256 (format JWT) dan disimpan pada cookie
 * httpOnly. Verifikasi dilakukan di server (Node runtime), bukan di edge,
 * sehingga memakai node:crypto.
 */

export const SESSION_COOKIE = "gsh_admin";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export interface SessionPayload {
  sub: string;
  iat: number;
  exp: number;
}

function secret(): string {
  const value = process.env.ADMIN_JWT_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "ADMIN_JWT_SECRET belum diset dengan benar (minimal 16 karakter). Periksa .env.local.",
    );
  }
  return value;
}

function encodeSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function signSession(username: string, now?: number): string {
  const issuedAt = now ?? Date.now();
  const header = encodeSegment({ alg: "HS256", typ: "JWT" });
  const payload = encodeSegment({
    sub: username,
    iat: Math.floor(issuedAt / 1000),
    exp: Math.floor((issuedAt + SESSION_TTL_MS) / 1000),
  } satisfies SessionPayload);

  const signature = createHmac("sha256", secret())
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

export function verifySession(token: string, now?: number): SessionPayload | null {
  const currentTime = now ?? Date.now();
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expected = createHmac("sha256", secret())
    .update(`${header}.${payload}`)
    .digest("base64url");

  const provided = Buffer.from(signature);
  const computed = Buffer.from(expected);
  if (provided.length !== computed.length || !timingSafeEqual(provided, computed)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionPayload;
    if (!decoded.sub || decoded.exp * 1000 <= currentTime) return null;
    return decoded;
  } catch {
    return null;
  }
}

/** Verifikasi password admin terhadap hash Bcrypt di environment. */
export async function verifyAdminPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash || hash.length < 20) return false;

  try {
    return await compare(plain, hash);
  } catch {
    return false;
  }
}

export function adminUsername(): string {
  return process.env.ADMIN_USERNAME ?? "admin";
}

/** Sesi aktif dari cookie, atau null. Selalu dirender saat request. */
export async function getSession(): Promise<SessionPayload | null> {
  await connection();

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    return verifySession(token);
  } catch {
    return null;
  }
}

/** Guard untuk halaman /admin/*: redirect ke login bila belum masuk. */
export async function requireAdmin(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

/* ------------------------------------------------------------------ */
/* Rate limiting login: maksimal 5 percobaan gagal per 15 menit / IP.  */
/* Disimpan di memori proses; cukup untuk deployment satu instance.    */
/* ------------------------------------------------------------------ */

const attempts = new Map<string, number[]>();

function prune(ip: string, now: number): number[] {
  const recent = (attempts.get(ip) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  attempts.set(ip, recent);
  return recent;
}

export function isLoginRateLimited(ip: string, now = Date.now()): boolean {
  return prune(ip, now).length >= MAX_ATTEMPTS;
}

export function recordFailedLogin(ip: string, now = Date.now()): void {
  const recent = prune(ip, now);
  recent.push(now);
  attempts.set(ip, recent);
}

export function clearLoginAttempts(ip: string): void {
  attempts.delete(ip);
}

export function retryAfterSeconds(ip: string, now = Date.now()): number {
  const recent = prune(ip, now);
  if (recent.length === 0) return 0;

  const oldest = recent[0];
  return Math.max(0, Math.ceil((oldest + WINDOW_MS - now) / 1000));
}

import { cookies } from "next/headers";
import { z } from "zod";

import {
  SESSION_COOKIE,
  adminUsername,
  clearLoginAttempts,
  isLoginRateLimited,
  recordFailedLogin,
  retryAfterSeconds,
  sessionCookieOptions,
  signSession,
  verifyAdminPassword,
} from "@/lib/auth";


const bodySchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(200),
});

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}

/** POST /api/v1/admin/login — 5 percobaan gagal / 15 menit per IP. */
export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request);

  if (isLoginRateLimited(ip)) {
    return Response.json(
      {
        success: false,
        error: "Terlalu banyak percobaan login. Coba lagi nanti.",
        retry_after_seconds: retryAfterSeconds(ip),
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Body JSON tidak valid." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: "Kredensial tidak valid." }, { status: 422 });
  }

  const usernameMatches = parsed.data.username === adminUsername();
  const passwordMatches = await verifyAdminPassword(parsed.data.password);

  if (!usernameMatches || !passwordMatches) {
    recordFailedLogin(ip);
    return Response.json(
      { success: false, error: "Username atau password salah." },
      { status: 401 },
    );
  }

  clearLoginAttempts(ip);
  const store = await cookies();
  store.set(SESSION_COOKIE, signSession(parsed.data.username), sessionCookieOptions());

  return Response.json({ success: true });
}

import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/auth";


/** POST /api/v1/admin/logout — hapus cookie sesi. */
export async function POST(): Promise<Response> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);

  return Response.json({ success: true });
}

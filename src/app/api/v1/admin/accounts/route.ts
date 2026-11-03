import { Prisma } from "@/generated/prisma/client";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { accountInputSchema, normalizeImages } from "@/lib/validation";


function unauthorized() {
  return Response.json({ success: false, error: "Tidak terautentikasi." }, { status: 401 });
}

/** POST /api/v1/admin/accounts — buat stok baru (PRD 12 §2). */
export async function POST(request: Request): Promise<Response> {
  if (!(await getSession())) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Body JSON tidak valid." }, { status: 400 });
  }

  const parsed = accountInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: "Data tidak valid.", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const data = parsed.data;

  try {
    const account = await prisma.account.create({
      data: {
        stockId: data.stockId,
        gameId: data.gameId,
        title: data.title,
        priceIdr: data.priceIdr,
        status: data.status,
        description: data.description ?? null,
        specsJson: data.specs,
        images: { create: normalizeImages(data.images) },
      },
      select: { id: true, stockId: true },
    });

    return Response.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return Response.json(
        { success: false, error: "ID stok sudah dipakai. Gunakan ID lain." },
        { status: 409 },
      );
    }

    console.error("[admin/accounts] gagal membuat stok:", error);
    return Response.json({ success: false, error: "Gagal menyimpan stok." }, { status: 500 });
  }
}

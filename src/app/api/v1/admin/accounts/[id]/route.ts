import { Prisma } from "@/generated/prisma/client";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteImageByUrl } from "@/lib/r2";
import { accountInputSchema, normalizeImages, statusInputSchema } from "@/lib/validation";


interface RouteContext {
  params: Promise<{ id: string }>;
}

function unauthorized() {
  return Response.json({ success: false, error: "Tidak terautentikasi." }, { status: 401 });
}

/** PUT /api/v1/admin/accounts/:id — perbarui stok (spesifikasi & gambar). */
export async function PUT(request: Request, { params }: RouteContext): Promise<Response> {
  if (!(await getSession())) return unauthorized();

  const { id } = await params;

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
    const updated = await prisma.account.update({
      where: { id },
      data: {
        stockId: data.stockId,
        gameId: data.gameId,
        title: data.title,
        priceIdr: data.priceIdr,
        status: data.status,
        description: data.description ?? null,
        specsJson: data.specs,
        images: { deleteMany: {}, create: normalizeImages(data.images) },
      },
      select: { id: true, stockId: true },
    });

    return Response.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return Response.json({ success: false, error: "Stok tidak ditemukan." }, { status: 404 });
      }
      if (error.code === "P2002") {
        return Response.json(
          { success: false, error: "ID stok sudah dipakai stok lain." },
          { status: 409 },
        );
      }
    }

    console.error("[admin/accounts] gagal memperbarui stok:", error);
    return Response.json({ success: false, error: "Gagal memperbarui stok." }, { status: 500 });
  }
}

/** DELETE /api/v1/admin/accounts/:id — hapus stok dan bersihkan gambar R2. */
export async function DELETE(_request: Request, { params }: RouteContext): Promise<Response> {
  if (!(await getSession())) return unauthorized();

  const { id } = await params;

  const account = await prisma.account.findUnique({
    where: { id },
    select: { id: true, images: { select: { r2ImageUrl: true } } },
  });

  if (!account) {
    return Response.json({ success: false, error: "Stok tidak ditemukan." }, { status: 404 });
  }

  await prisma.account.delete({ where: { id } });

  // Best effort: kegagalan purge R2 tidak membatalkan penghapusan data.
  for (const image of account.images) {
    try {
      await deleteImageByUrl(image.r2ImageUrl);
    } catch (error) {
      console.error("[admin/accounts] gagal menghapus objek R2:", error);
    }
  }

  return Response.json({ success: true });
}

/** PATCH /api/v1/admin/accounts/:id — ubah status cepat READY <-> SOLD. */
export async function PATCH(request: Request, { params }: RouteContext): Promise<Response> {
  if (!(await getSession())) return unauthorized();

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Body JSON tidak valid." }, { status: 400 });
  }

  const parsed = statusInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, error: "Status tidak valid." }, { status: 422 });
  }

  try {
    const updated = await prisma.account.update({
      where: { id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });

    return Response.json({ success: true, data: updated });
  } catch {
    return Response.json({ success: false, error: "Stok tidak ditemukan." }, { status: 404 });
  }
}

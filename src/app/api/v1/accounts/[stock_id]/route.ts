import { connection } from "next/server";

import { prisma } from "@/lib/db";

/**
 * GET /api/v1/accounts/:stock_id
 * Detail satu stok akun beserta seluruh screenshot R2.
 * Kontrak: PRD 12 §1.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stock_id: string }> },
): Promise<Response> {
  await connection();

  const { stock_id } = await params;
  const stockId = decodeURIComponent(stock_id);

  const account = await prisma.account.findUnique({
    where: { stockId },
    select: {
      id: true,
      stockId: true,
      title: true,
      priceIdr: true,
      status: true,
      specsJson: true,
      description: true,
      createdAt: true,
      game: { select: { name: true, slug: true, iconUrl: true } },
      images: {
        orderBy: { displayOrder: "asc" },
        select: { r2ImageUrl: true, isPrimary: true, displayOrder: true },
      },
    },
  });

  if (!account) {
    return Response.json(
      { success: false, error: "Stok akun tidak ditemukan." },
      { status: 404 },
    );
  }

  return Response.json({
    success: true,
    data: {
      id: account.id,
      stock_id: account.stockId,
      title: account.title,
      price_idr: Number(account.priceIdr),
      status: account.status,
      specs: account.specsJson,
      description: account.description,
      game: {
        name: account.game.name,
        slug: account.game.slug,
        icon_url: account.game.iconUrl,
      },
      images: account.images.map((image) => ({
        url: image.r2ImageUrl,
        is_primary: image.isPrimary,
        display_order: image.displayOrder,
      })),
      created_at: account.createdAt.toISOString(),
    },
  });
}

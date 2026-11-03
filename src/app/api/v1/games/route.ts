import { connection } from "next/server";

import { prisma } from "@/lib/db";

/**
 * GET /api/v1/games
 * Daftar kategori game beserta jumlah stok yang masih READY.
 * Kontrak: PRD 12 §1.
 */
export async function GET(): Promise<Response> {
  await connection();

  const [games, readyPerGame] = await Promise.all([
    prisma.game.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, iconUrl: true },
    }),
    prisma.account.groupBy({
      by: ["gameId"],
      where: { status: "READY" },
      _count: { _all: true },
    }),
  ]);

  const readyByGameId = new Map(
    readyPerGame.map((row) => [row.gameId, row._count._all]),
  );

  return Response.json({
    success: true,
    data: games.map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
      icon_url: game.iconUrl,
      total_stock: readyByGameId.get(game.id) ?? 0,
    })),
  });
}

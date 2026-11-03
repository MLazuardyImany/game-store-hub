import { connection } from "next/server";
import { z } from "zod";

import { calculateBoosting } from "@/lib/boosting";
import { toIdrNumber } from "@/lib/currency";
import { prisma } from "@/lib/db";


const bodySchema = z.object({
  game_id: z.string().uuid(),
  current_rank_id: z.string().uuid(),
  target_rank_id: z.string().uuid(),
  addons: z.array(z.enum(["express", "request_hero", "mabar"])).default([]),
});

/**
 * POST /api/v1/boosting/calculate
 * Kontrak: PRD 12 §1. Perhitungan memakai fungsi murni yang sama dengan UI
 * sehingga hasil API dan kalkulator tidak mungkin berbeda.
 */
export async function POST(request: Request): Promise<Response> {
  await connection();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: "Body JSON tidak valid." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: "Payload tidak valid.", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { game_id, current_rank_id, target_rank_id, addons } = parsed.data;

  const game = await prisma.game.findUnique({
    where: { id: game_id },
    include: { ranks: true, boostingRates: true },
  });

  if (!game) {
    return Response.json({ success: false, error: "Game tidak ditemukan." }, { status: 404 });
  }

  const result = calculateBoosting({
    ranks: game.ranks.map((rank) => ({
      id: rank.id,
      name: rank.name,
      rankOrder: rank.rankOrder,
    })),
    rates: game.boostingRates.map((rate) => ({
      fromRankId: rate.fromRankId,
      toRankId: rate.toRankId,
      pricePerUnitIdr: toIdrNumber(rate.pricePerUnitIdr),
    })),
    fromRankId: current_rank_id,
    toRankId: target_rank_id,
    addonIds: addons,
  });

  if (!result.ok) {
    return Response.json({ success: false, error: result.error }, { status: 422 });
  }

  return Response.json({
    success: true,
    estimated_price_idr: result.totalIdr,
    estimated_days: result.estimatedDays,
    breakdown: result.breakdown,
    subtotal_idr: result.subtotalIdr,
    addon_total_idr: result.addonTotalIdr,
  });
}

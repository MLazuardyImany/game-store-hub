import type { Prisma } from "@/generated/prisma/client";
import { connection } from "next/server";

import { prisma } from "@/lib/db";

const ACCOUNT_STATUSES = ["READY", "BOOKED", "SOLD"] as const;
type AccountStatusFilter = (typeof ACCOUNT_STATUSES)[number];

const SORT_OPTIONS = {
  newest: { createdAt: "desc" },
  price_asc: { priceIdr: "asc" },
  price_desc: { priceIdr: "desc" },
} satisfies Record<string, Prisma.AccountOrderByWithRelationInput>;

type SortKey = keyof typeof SORT_OPTIONS;

function isSortKey(value: string): value is SortKey {
  return Object.prototype.hasOwnProperty.call(SORT_OPTIONS, value);
}

function isStatus(value: string): value is AccountStatusFilter {
  return (ACCOUNT_STATUSES as readonly string[]).includes(value);
}

function parseInteger(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (raw === null || raw.trim() === "") return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return fallback;

  return Math.min(Math.max(parsed, min), max);
}

/**
 * GET /api/v1/accounts
 * Query: game, search, min_price, max_price, status, sort, page, limit.
 * Kontrak: PRD 12 §1 (dengan pagination tambahan).
 */
export async function GET(request: Request): Promise<Response> {
  await connection();

  const { searchParams } = new URL(request.url);

  const gameSlug = searchParams.get("game")?.trim();
  const search = searchParams.get("search")?.trim();
  const statusParam = searchParams.get("status")?.trim().toUpperCase();
  const sortParam = searchParams.get("sort")?.trim() ?? "newest";

  const page = parseInteger(searchParams.get("page"), 1, 1, 10_000);
  const limit = parseInteger(searchParams.get("limit"), 12, 1, 48);

  const where: Prisma.AccountWhereInput = {};

  if (gameSlug) {
    where.game = { slug: gameSlug };
  }

  if (statusParam && isStatus(statusParam)) {
    where.status = statusParam;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { stockId: { contains: search, mode: "insensitive" } },
    ];
  }

  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");

  if (minPrice || maxPrice) {
    const priceFilter: Prisma.DecimalFilter = {};

    if (minPrice) {
      const value = Number(minPrice);
      if (!Number.isNaN(value)) priceFilter.gte = value;
    }

    if (maxPrice) {
      const value = Number(maxPrice);
      if (!Number.isNaN(value)) priceFilter.lte = value;
    }

    if (Object.keys(priceFilter).length > 0) {
      where.priceIdr = priceFilter;
    }
  }

  const orderBy = SORT_OPTIONS[isSortKey(sortParam) ? sortParam : "newest"];

  const [total, accounts] = await Promise.all([
    prisma.account.count({ where }),
    prisma.account.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        stockId: true,
        title: true,
        priceIdr: true,
        status: true,
        specsJson: true,
        createdAt: true,
        game: { select: { name: true, slug: true } },
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { r2ImageUrl: true },
        },
      },
    }),
  ]);

  return Response.json({
    success: true,
    data: accounts.map((account) => ({
      id: account.id,
      stock_id: account.stockId,
      title: account.title,
      price_idr: Number(account.priceIdr),
      status: account.status,
      specs: account.specsJson,
      primary_image_url: account.images[0]?.r2ImageUrl ?? null,
      game: account.game,
      created_at: account.createdAt.toISOString(),
    })),
    meta: {
      page,
      limit,
      total,
      total_pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
}

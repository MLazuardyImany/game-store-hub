import { prisma } from "@/lib/db";
import { toIdrNumber } from "@/lib/currency";

/**
 * Lapisan query baca untuk halaman publik.
 * Server-only: dipakai Server Component agar tidak ada request HTTP
 * internal ke API sendiri.
 */

export interface GameWithStock {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  totalStock: number;
}

export async function getGamesWithStock(): Promise<GameWithStock[]> {
  const [games, grouped] = await Promise.all([
    prisma.game.findMany({ orderBy: { name: "asc" } }),
    prisma.account.groupBy({
      by: ["gameId"],
      where: { status: "READY" },
      _count: { _all: true },
    }),
  ]);

  const ready = new Map(grouped.map((row) => [row.gameId, row._count._all]));

  return games.map((game) => ({
    id: game.id,
    name: game.name,
    slug: game.slug,
    iconUrl: game.iconUrl,
    totalStock: ready.get(game.id) ?? 0,
  }));
}

export interface CatalogFilters {
  gameSlug?: string;
  search?: string;
  status?: "READY" | "BOOKED" | "SOLD";
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
}

export interface CatalogItem {
  id: string;
  stockId: string;
  title: string;
  priceIdr: number;
  status: "READY" | "BOOKED" | "SOLD";
  specs: Record<string, unknown>;
  gameName: string;
  gameSlug: string;
  primaryImageUrl: string | null;
  createdAt: string;
}

export interface CatalogResult {
  items: CatalogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  gameName: string | null;
}

const SORT_MAP = {
  newest: { createdAt: "desc" as const },
  price_asc: { priceIdr: "asc" as const },
  price_desc: { priceIdr: "desc" as const },
};

export async function getCatalog(filters: CatalogFilters): Promise<CatalogResult> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(48, Math.max(1, filters.limit ?? 12));

  const where = {
    ...(filters.gameSlug ? { game: { slug: filters.gameSlug } } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: "insensitive" as const } },
            { stockId: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          priceIdr: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };

  const [total, rows, game] = await Promise.all([
    prisma.account.count({ where }),
    prisma.account.findMany({
      where,
      orderBy: SORT_MAP[filters.sort ?? "newest"],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        game: true,
        images: { where: { isPrimary: true }, take: 1 },
      },
    }),
    filters.gameSlug
      ? prisma.game.findUnique({ where: { slug: filters.gameSlug } })
      : Promise.resolve(null),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      stockId: row.stockId,
      title: row.title,
      priceIdr: toIdrNumber(row.priceIdr),
      status: row.status,
      specs: (row.specsJson ?? {}) as Record<string, unknown>,
      gameName: row.game.name,
      gameSlug: row.game.slug,
      primaryImageUrl: row.images[0]?.r2ImageUrl ?? null,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    gameName: game?.name ?? null,
  };
}

export interface AccountDetail extends CatalogItem {
  description: string | null;
  images: Array<{ url: string; isPrimary: boolean }>;
  gameIconUrl: string | null;
}

export async function getAccountDetail(stockId: string): Promise<AccountDetail | null> {
  const account = await prisma.account.findUnique({
    where: { stockId },
    include: {
      game: true,
      images: { orderBy: { displayOrder: "asc" } },
    },
  });

  if (!account) return null;

  const primary = account.images.find((image) => image.isPrimary) ?? account.images[0];

  return {
    id: account.id,
    stockId: account.stockId,
    title: account.title,
    priceIdr: toIdrNumber(account.priceIdr),
    status: account.status,
    specs: (account.specsJson ?? {}) as Record<string, unknown>,
    gameName: account.game.name,
    gameSlug: account.game.slug,
    primaryImageUrl: primary?.r2ImageUrl ?? null,
    createdAt: account.createdAt.toISOString(),
    description: account.description,
    images: account.images.map((image) => ({
      url: image.r2ImageUrl,
      isPrimary: image.isPrimary,
    })),
    gameIconUrl: account.game.iconUrl,
  };
}

export interface BoostingGameData {
  id: string;
  name: string;
  slug: string;
  ranks: Array<{ id: string; name: string; rankOrder: number }>;
  rates: Array<{ fromRankId: string; toRankId: string; pricePerUnitIdr: number }>;
}

export async function getBoostingCatalog(): Promise<BoostingGameData[]> {
  const games = await prisma.game.findMany({
    orderBy: { name: "asc" },
    include: {
      ranks: { orderBy: { rankOrder: "asc" } },
      boostingRates: true,
    },
  });

  return games
    .filter((game) => game.ranks.length >= 2)
    .map((game) => ({
      id: game.id,
      name: game.name,
      slug: game.slug,
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
    }));
}

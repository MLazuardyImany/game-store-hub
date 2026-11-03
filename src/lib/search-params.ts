import type { FilterValues } from "@/components/catalog/filter-bar";
import type { CatalogFilters } from "@/lib/queries";

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

const STATUSES = new Set(["READY", "BOOKED", "SOLD"]);
const SORTS = new Set(["newest", "price_asc", "price_desc"]);

/** Menormalkan query string katalog menjadi filter Prisma + nilai form. */
export function parseCatalogParams(
  raw: RawSearchParams,
  gameSlugFromPath?: string,
): { filters: CatalogFilters; values: FilterValues } {
  const search = first(raw.search)?.trim() || undefined;
  const gameParam = first(raw.game)?.trim() || undefined;
  const status = first(raw.status)?.toUpperCase();
  const sort = first(raw.sort);
  const minPrice = toNumber(first(raw.min_price));
  const maxPrice = toNumber(first(raw.max_price));
  const page = toNumber(first(raw.page)) ?? 1;

  const game = gameSlugFromPath ?? gameParam;

  return {
    filters: {
      gameSlug: game,
      search,
      status: status && STATUSES.has(status) ? (status as CatalogFilters["status"]) : undefined,
      minPrice,
      maxPrice,
      sort: sort && SORTS.has(sort) ? (sort as CatalogFilters["sort"]) : "newest",
      page,
      limit: 12,
    },
    values: {
      search,
      status: status && STATUSES.has(status) ? status : undefined,
      sort: sort && SORTS.has(sort) ? sort : "newest",
      minPrice,
      maxPrice,
      game: gameParam,
    },
  };
}

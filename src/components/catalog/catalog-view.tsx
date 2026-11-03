import Link from "next/link";
import { connection } from "next/server";

import { AccountCard } from "@/components/catalog/account-card";
import { FilterBar, type FilterValues } from "@/components/catalog/filter-bar";
import { getCatalog, getGamesWithStock, type CatalogFilters } from "@/lib/queries";

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }

  if (page > 1) query.set("page", String(page));

  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/** Tampilan katalog yang dipakai ulang oleh /catalog dan /catalog/[game_slug]. */
export async function CatalogView({
  basePath,
  filters,
  values,
  showGameFilter = false,
}: {
  basePath: string;
  filters: CatalogFilters;
  values: FilterValues;
  showGameFilter?: boolean;
}) {
  await connection();

  const [result, games] = await Promise.all([
    getCatalog(filters),
    showGameFilter ? getGamesWithStock() : Promise.resolve([]),
  ]);

  const queryParams: Record<string, string | undefined> = {
    search: values.search,
    status: values.status,
    sort: values.sort,
    min_price: values.minPrice !== undefined ? String(values.minPrice) : undefined,
    max_price: values.maxPrice !== undefined ? String(values.maxPrice) : undefined,
    game: values.game,
  };

  return (
    <div className="space-y-6">
      <FilterBar
        action={basePath}
        values={values}
        games={games}
        showGameFilter={showGameFilter}
      />

      <div className="flex items-center justify-between gap-4 text-xs text-ink-muted">
        <p>
          {result.total} stok ditemukan
          {result.gameName ? ` di ${result.gameName}` : ""}
        </p>
        <p>
          Halaman {result.page} dari {result.totalPages}
        </p>
      </div>

      {result.items.length === 0 ? (
        <p className="rounded-card border border-dashed border-line/70 p-10 text-center text-sm text-ink-muted">
          Tidak ada stok yang cocok dengan filter ini. Coba longgarkan rentang harga atau
          hapus kata kunci.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map((item) => (
            <li key={item.id}>
              <AccountCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-2" aria-label="Paginasi">
          {result.page > 1 ? (
            <Link
              href={buildHref(basePath, queryParams, result.page - 1)}
              className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm text-ink-muted transition hover:text-ink"
            >
              Sebelumnya
            </Link>
          ) : null}

          <span className="px-2 text-xs text-ink-muted">
            {result.page} / {result.totalPages}
          </span>

          {result.page < result.totalPages ? (
            <Link
              href={buildHref(basePath, queryParams, result.page + 1)}
              className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm text-ink-muted transition hover:text-ink"
            >
              Berikutnya
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

import Link from "next/link";

import type { GameWithStock } from "@/lib/queries";

export interface FilterValues {
  search?: string;
  status?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  game?: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua status" },
  { value: "READY", label: "Ready" },
  { value: "BOOKED", label: "Booked" },
  { value: "SOLD", label: "Terjual" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Terbaru" },
  { value: "price_asc", label: "Harga terendah" },
  { value: "price_desc", label: "Harga tertinggi" },
];

const FIELD =
  "min-h-11 w-full rounded-lg border border-line bg-backdrop/70 px-3 text-sm text-ink outline-none focus:border-accent/60";

/** Bar filter katalog: murni form GET agar state bisa dibagikan via URL. */
export function FilterBar({
  action,
  values,
  games,
  showGameFilter = false,
}: {
  action: string;
  values: FilterValues;
  games?: GameWithStock[];
  showGameFilter?: boolean;
}) {
  return (
    <form
      action={action}
      method="get"
      className="grid gap-3 rounded-card border border-line/70 bg-surface/50 p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <div className="lg:col-span-2">
        <label htmlFor="search" className="mb-1.5 block text-[11px] text-ink-muted">
          Kata kunci
        </label>
        <input
          id="search"
          name="search"
          type="search"
          defaultValue={values.search ?? ""}
          placeholder="Judul atau ID stok"
          className={FIELD}
        />
      </div>

      {showGameFilter && games ? (
        <div>
          <label htmlFor="game" className="mb-1.5 block text-[11px] text-ink-muted">
            Game
          </label>
          <select id="game" name="game" defaultValue={values.game ?? ""} className={FIELD}>
            <option value="">Semua game</option>
            {games.map((game) => (
              <option key={game.id} value={game.slug}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label htmlFor="status" className="mb-1.5 block text-[11px] text-ink-muted">
          Status
        </label>
        <select id="status" name="status" defaultValue={values.status ?? ""} className={FIELD}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="min_price" className="mb-1.5 block text-[11px] text-ink-muted">
          Harga min (Rp)
        </label>
        <input
          id="min_price"
          name="min_price"
          type="number"
          inputMode="numeric"
          min={0}
          step={10000}
          defaultValue={values.minPrice ?? ""}
          placeholder="0"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="max_price" className="mb-1.5 block text-[11px] text-ink-muted">
          Harga maks (Rp)
        </label>
        <input
          id="max_price"
          name="max_price"
          type="number"
          inputMode="numeric"
          min={0}
          step={10000}
          defaultValue={values.maxPrice ?? ""}
          placeholder="Tanpa batas"
          className={FIELD}
        />
      </div>

      <div>
        <label htmlFor="sort" className="mb-1.5 block text-[11px] text-ink-muted">
          Urutkan
        </label>
        <select id="sort" name="sort" defaultValue={values.sort ?? "newest"} className={FIELD}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
        <button
          type="submit"
          className="min-h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-obsidian transition hover:bg-accent/90"
        >
          Terapkan filter
        </button>
        <Link
          href={action}
          className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm text-ink-muted transition hover:text-ink"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}

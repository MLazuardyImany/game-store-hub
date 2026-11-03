import { connection } from "next/server";
import { Trash2 } from "lucide-react";

import { formatRupiah, toIdrNumber } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { createRankAction, deleteRateAction, upsertRateAction } from "../actions";

const FIELD =
  "min-h-9 w-full rounded-lg border border-line bg-backdrop/70 px-2 text-xs text-ink outline-none focus:border-accent/60";

export default async function AdminBoostingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const params = await searchParams;
  const ok = typeof params.ok === "string" ? params.ok : null;
  const error = typeof params.error === "string" ? params.error : null;

  const games = await prisma.game.findMany({
    orderBy: { name: "asc" },
    include: {
      ranks: { orderBy: { rankOrder: "asc" } },
      boostingRates: true,
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Tarif Boosting</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Tarif disimpan per segmen rank. Kalkulator menjumlahkan segmen dari rank awal ke
          target memakai <code className="text-accent">rank_order</code>.
        </p>
      </header>

      {ok ? (
        <p className="rounded-lg border border-accent-emerald/40 bg-accent-emerald/10 p-3 text-sm text-accent-emerald">
          {ok}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-lg border border-accent-danger/40 bg-accent-danger/10 p-3 text-sm text-accent-danger">
          {error}
        </p>
      ) : null}

      {games.map((game) => {
        const rankName = new Map(game.ranks.map((rank) => [rank.id, rank.name]));

        return (
          <section
            key={game.id}
            className="space-y-4 rounded-card border border-line/70 bg-surface/50 p-5"
          >
            <h2 className="text-sm font-semibold">{game.name}</h2>

            <div className="flex flex-wrap gap-1.5">
              {game.ranks.map((rank) => (
                <span
                  key={rank.id}
                  className="rounded-pill border border-line/70 bg-backdrop/60 px-2.5 py-1 text-[11px] text-ink-muted"
                >
                  {rank.rankOrder}. {rank.name}
                </span>
              ))}
              {game.ranks.length === 0 ? (
                <span className="text-xs text-ink-muted">Belum ada rank.</span>
              ) : null}
            </div>

            <form action={createRankAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="gameId" value={game.id} />
              <input name="name" placeholder="Nama rank" required className={`${FIELD} max-w-48`} />
              <input
                name="rankOrder"
                type="number"
                min={1}
                placeholder="Urutan"
                required
                className={`${FIELD} max-w-24`}
              />
              <button
                type="submit"
                className="min-h-9 rounded-lg border border-line px-3 text-xs text-ink-muted hover:text-ink"
              >
                Tambah rank
              </button>
            </form>

            {game.ranks.length >= 2 ? (
              <form action={upsertRateAction} className="flex flex-wrap items-end gap-2">
                <select name="fromRankId" required className={`${FIELD} max-w-44`}>
                  {game.ranks.map((rank) => (
                    <option key={rank.id} value={rank.id}>
                      {rank.name}
                    </option>
                  ))}
                </select>
                <select name="toRankId" required className={`${FIELD} max-w-44`}>
                  {game.ranks.map((rank) => (
                    <option key={rank.id} value={rank.id}>
                      {rank.name}
                    </option>
                  ))}
                </select>
                <input
                  name="pricePerUnitIdr"
                  inputMode="numeric"
                  placeholder="Tarif (Rp)"
                  required
                  className={`${FIELD} max-w-36`}
                />
                <button
                  type="submit"
                  className="min-h-9 rounded-lg bg-accent px-3 text-xs font-semibold text-obsidian"
                >
                  Simpan tarif
                </button>
              </form>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-xs">
                <thead className="text-left text-[11px] tracking-wide text-ink-muted uppercase">
                  <tr>
                    <th className="py-2 font-medium">Dari</th>
                    <th className="py-2 font-medium">Ke</th>
                    <th className="py-2 font-medium">Tarif</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {game.boostingRates.map((rate) => (
                    <tr key={rate.id} className="border-t border-line/40">
                      <td className="py-2 text-ink-muted">{rankName.get(rate.fromRankId)}</td>
                      <td className="py-2 text-ink-muted">{rankName.get(rate.toRankId)}</td>
                      <td className="py-2 text-ink">
                        {formatRupiah(toIdrNumber(rate.pricePerUnitIdr))}
                      </td>
                      <td className="py-2 text-right">
                        <form action={deleteRateAction}>
                          <input type="hidden" name="id" value={rate.id} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded-md border border-accent-danger/40 px-2 py-1 text-[11px] text-accent-danger"
                          >
                            <Trash2 className="size-3" aria-hidden />
                            Hapus
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                  {game.boostingRates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 text-ink-muted">
                        Belum ada tarif.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}

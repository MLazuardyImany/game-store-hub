import type { Metadata } from "next";
import { connection } from "next/server";

import { BoostingCalculator } from "@/components/boosting/boosting-calculator";
import { formatRupiah } from "@/lib/currency";
import { getBoostingCatalog } from "@/lib/queries";

/** Halaman memakai data runtime (DB) sehingga tidak di-prerender. */
export const instant = false;

export const metadata: Metadata = {
  title: "Kalkulator Jasa Boosting",
  description:
    "Hitung estimasi biaya jasa boosting (joki) dalam Rupiah secara real-time, lengkap dengan estimasi waktu pengerjaan.",
};

export default async function BoostingPage() {
  await connection();

  const games = await getBoostingCatalog();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-xs tracking-wide text-ink-muted uppercase">Jasa boosting</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Hitung Biaya Joki
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Pilih game, tentukan rank awal dan target, lalu tambahkan add-on bila perlu.
          Total biaya dihitung langsung dalam Rupiah tanpa reload halaman.
        </p>
      </header>

      <BoostingCalculator games={games} />

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">Tabel Tarif Dasar</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Tarif per segmen rank. Total order adalah penjumlahan segmen yang dilewati.
        </p>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {games.map((game) => (
            <div
              key={game.id}
              className="overflow-hidden rounded-card border border-line/70 bg-surface/50"
            >
              <h3 className="border-b border-line/60 px-4 py-3 text-sm font-semibold">
                {game.name}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] tracking-wide text-ink-muted uppercase">
                    <th className="px-4 py-2 font-medium">Dari</th>
                    <th className="px-4 py-2 font-medium">Ke</th>
                    <th className="px-4 py-2 text-right font-medium">Tarif</th>
                  </tr>
                </thead>
                <tbody>
                  {game.rates.map((rate) => {
                    const from = game.ranks.find((rank) => rank.id === rate.fromRankId);
                    const to = game.ranks.find((rank) => rank.id === rate.toRankId);
                    if (!from || !to) return null;

                    return (
                      <tr key={`${rate.fromRankId}-${rate.toRankId}`} className="border-t border-line/40">
                        <td className="px-4 py-2 text-ink-muted">{from.name}</td>
                        <td className="px-4 py-2 text-ink-muted">{to.name}</td>
                        <td className="px-4 py-2 text-right font-medium text-ink">
                          {formatRupiah(rate.pricePerUnitIdr)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

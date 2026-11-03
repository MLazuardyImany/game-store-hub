import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, Boxes, ShieldCheck, Sparkles, Zap } from "lucide-react";

import { AccountCard } from "@/components/catalog/account-card";
import { getCatalog, getGamesWithStock } from "@/lib/queries";

/** Halaman memakai data runtime (DB) sehingga tidak di-prerender. */
export const instant = false;

export const metadata = {
  title: "Katalog Akun Game & Jasa Boosting",
};

export default async function HomePage() {
  await connection();

  const [games, featured] = await Promise.all([
    getGamesWithStock(),
    getCatalog({ status: "READY", limit: 6 }),
  ]);

  const totalStock = games.reduce((sum, game) => sum + game.totalStock, 0);

  return (
    <main className="relative isolate">
      <div aria-hidden className="bg-grid-faint pointer-events-none absolute inset-0 -z-10 opacity-60" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-56 left-1/2 -z-10 h-[420px] w-[760px] max-w-none -translate-x-1/2 rounded-full bg-accent/15 blur-[140px]"
      />

      <section className="mx-auto w-full max-w-6xl px-4 pt-14 pb-10 sm:px-6 sm:pt-20">
        <p className="inline-flex w-fit items-center gap-2 rounded-pill border border-line/80 bg-surface/60 px-3.5 py-1.5 text-xs text-ink-muted">
          <span className="size-1.5 rounded-full bg-accent-emerald" aria-hidden />
          {totalStock} stok siap kirim · {games.length} kategori game
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">
          Cari akun game impian, hitung <span className="text-accent">joki</span> tanpa
          nebak harga.
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Setiap akun punya screenshot asli dan status binding yang jelas. Kalkulator
          boosting menghitung biaya dalam Rupiah secara real-time — tanpa perlu daftar akun.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/catalog"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-obsidian transition hover:bg-accent/90"
          >
            Lihat Katalog
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/boosting"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line bg-surface/70 px-5 text-sm font-semibold text-ink transition hover:border-accent/50"
          >
            <Sparkles className="size-4 text-accent" aria-hidden />
            Hitung Biaya Joki
          </Link>
        </div>

        <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-muted">
          <li className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-accent-emerald" aria-hidden />
            100% akun diverifikasi manual
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Zap className="size-4 text-accent" aria-hidden />
            Order langsung ke admin toko
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Boxes className="size-4 text-accent-violet" aria-hidden />
            Status stok selalu diperbarui
          </li>
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Kategori Game</h2>
          <Link href="/catalog" className="text-xs text-ink-muted transition hover:text-ink">
            Semua stok
          </Link>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {games.map((game) => (
            <li key={game.id}>
              <Link
                href={`/catalog/${game.slug}`}
                className="group flex items-center gap-3 rounded-card border border-line/70 bg-surface/60 p-4 transition hover:border-accent/40 hover:bg-surface"
              >
                {game.iconUrl ? (
                  <Image
                    src={game.iconUrl}
                    alt=""
                    width={44}
                    height={44}
                    unoptimized
                    className="size-11 shrink-0 rounded-xl ring-1 ring-line/60"
                  />
                ) : (
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-backdrop text-xs text-ink-muted">
                    {game.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{game.name}</span>
                  <span className="mt-0.5 block text-[11px] text-ink-muted">
                    {game.totalStock} stok ready
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Stok Terbaru</h2>
          <Link href="/catalog" className="text-xs text-ink-muted transition hover:text-ink">
            Lihat semua
          </Link>
        </div>

        {featured.items.length === 0 ? (
          <p className="mt-6 rounded-card border border-dashed border-line/70 p-8 text-center text-sm text-ink-muted">
            Belum ada stok ready. Jalankan seed atau tambah stok dari dashboard admin.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((item) => (
              <li key={item.id}>
                <AccountCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

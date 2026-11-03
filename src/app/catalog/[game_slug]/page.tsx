import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CatalogView } from "@/components/catalog/catalog-view";
import { prisma } from "@/lib/db";
import { parseCatalogParams, type RawSearchParams } from "@/lib/search-params";

/** Halaman memakai data runtime (DB) sehingga tidak di-prerender. */
export const instant = false;

interface PageProps {
  params: Promise<{ game_slug: string }>;
  searchParams: Promise<RawSearchParams>;
}

async function findGame(slug: string) {
  return prisma.game.findUnique({ where: { slug }, select: { name: true, slug: true } });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { game_slug } = await params;
  const game = await findGame(game_slug);

  if (!game) return { title: "Game tidak ditemukan" };

  return {
    title: `Stok Akun ${game.name}`,
    description: `Daftar stok akun ${game.name} yang tersedia, lengkap dengan harga Rupiah dan status ketersediaan.`,
  };
}

export default async function GameCatalogPage({ params, searchParams }: PageProps) {
  const [{ game_slug }, raw] = await Promise.all([params, searchParams]);
  const game = await findGame(game_slug);

  if (!game) notFound();

  const { filters, values } = parseCatalogParams(raw, game.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <p className="text-xs tracking-wide text-ink-muted uppercase">Katalog game</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
          Stok Akun {game.name}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Gunakan filter harga dan status untuk mempersempit pilihan. Stok bertanda
          TERJUAL tidak bisa dipesan.
        </p>
      </header>

      <CatalogView
        basePath={`/catalog/${game.slug}`}
        filters={filters}
        values={values}
      />
    </main>
  );
}

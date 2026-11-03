import type { Metadata } from "next";

import { CatalogView } from "@/components/catalog/catalog-view";
import { parseCatalogParams, type RawSearchParams } from "@/lib/search-params";

/** Halaman memakai data runtime (DB) sehingga tidak di-prerender. */
export const instant = false;

export const metadata: Metadata = {
  title: "Katalog Stok Akun",
  description:
    "Telusuri stok akun game yang tersedia: filter berdasarkan game, status, dan rentang harga Rupiah.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const { filters, values } = parseCatalogParams(raw);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Katalog Stok Akun
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-muted">
          Semua stok bisa dilihat tanpa login. Klik kartu untuk melihat screenshot dan
          spesifikasi lengkap sebelum menghubungi admin.
        </p>
      </header>

      <CatalogView
        basePath="/catalog"
        filters={filters}
        values={values}
        showGameFilter
      />
    </main>
  );
}

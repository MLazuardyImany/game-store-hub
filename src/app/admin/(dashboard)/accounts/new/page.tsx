import { connection } from "next/server";

import { AccountForm } from "@/components/admin/account-form";
import { prisma } from "@/lib/db";

/** Halaman admin membaca DB saat request; blokir sampai data siap. */
export const instant = false;

export default async function NewAccountPage() {
  await connection();

  const games = await prisma.game.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Stok Baru</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Isi spesifikasi apa adanya. Screenshot akan dikompres ke WebP sebelum masuk R2.
        </p>
      </header>

      {games.length === 0 ? (
        <p className="rounded-card border border-dashed border-line/70 p-6 text-sm text-ink-muted">
          Belum ada kategori game. Buat kategori terlebih dahulu di menu Kategori.
        </p>
      ) : (
        <AccountForm games={games} />
      )}
    </div>
  );
}

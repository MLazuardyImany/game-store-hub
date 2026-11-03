import { connection } from "next/server";
import { Trash2 } from "lucide-react";

import { prisma } from "@/lib/db";
import { createGameAction, deleteGameAction, updateGameAction } from "../actions";

const FIELD =
  "min-h-11 w-full rounded-lg border border-line bg-backdrop/70 px-3 text-sm text-ink outline-none focus:border-accent/60";

export default async function AdminCategoriesPage({
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
    include: { _count: { select: { accounts: true, ranks: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Kategori Game</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Kategori dengan stok aktif tidak bisa dihapus sebelum stoknya dipindahkan.
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

      <form
        action={createGameAction}
        className="grid gap-3 rounded-card border border-line/70 bg-surface/50 p-5 sm:grid-cols-4"
      >
        <div>
          <label htmlFor="name" className="mb-1.5 block text-[11px] text-ink-muted">
            Nama game
          </label>
          <input id="name" name="name" required className={FIELD} placeholder="Mobile Legends" />
        </div>
        <div>
          <label htmlFor="slug" className="mb-1.5 block text-[11px] text-ink-muted">
            Slug URL
          </label>
          <input
            id="slug"
            name="slug"
            required
            className={FIELD}
            placeholder="mobile-legends"
          />
        </div>
        <div>
          <label htmlFor="iconUrl" className="mb-1.5 block text-[11px] text-ink-muted">
            URL ikon (opsional)
          </label>
          <input id="iconUrl" name="iconUrl" className={FIELD} placeholder="/mock/icons/ml.svg" />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="min-h-11 w-full rounded-lg bg-accent px-4 text-sm font-semibold text-obsidian"
          >
            Tambah kategori
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-card border border-line/70">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-surface/70 text-left text-[11px] tracking-wide text-ink-muted uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Stok</th>
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id} className="border-t border-line/50">
                <td className="px-4 py-3 text-ink">{game.name}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-ink-muted">{game.slug}</td>
                <td className="px-4 py-3 text-ink-muted">{game._count.accounts}</td>
                <td className="px-4 py-3 text-ink-muted">{game._count.ranks}</td>
                <td className="px-4 py-3 text-right">
                  <details className="text-left">
                    <summary className="cursor-pointer text-xs text-ink-muted hover:text-ink">
                      Edit
                    </summary>
                    <form action={updateGameAction} className="mt-2 space-y-1.5">
                      <input type="hidden" name="id" value={game.id} />
                      <input name="name" defaultValue={game.name} className={FIELD} required />
                      <input name="slug" defaultValue={game.slug} className={FIELD} required />
                      <input
                        name="iconUrl"
                        defaultValue={game.iconUrl ?? ""}
                        placeholder="URL ikon"
                        className={FIELD}
                      />
                      <button
                        type="submit"
                        className="min-h-9 w-full rounded-lg bg-accent px-3 text-xs font-semibold text-obsidian"
                      >
                        Simpan
                      </button>
                    </form>
                  </details>

                  <form action={deleteGameAction} className="mt-2">
                    <input type="hidden" name="id" value={game.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-accent-danger/40 px-3 py-1.5 text-xs text-accent-danger"
                    >
                      <Trash2 className="size-3.5" aria-hidden />
                      Hapus
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { connection } from "next/server";

import { toIdrNumber } from "@/lib/currency";
import { prisma } from "@/lib/db";

/** Halaman admin membaca DB saat request; blokir sampai data siap. */
export const instant = false;

/** Ringkasan angka untuk dashboard admin. */
export default async function AdminHomePage() {
  await connection();

  const [games, accounts, ready, booked, sold, inquiries, topAccounts] = await Promise.all([
    prisma.game.count(),
    prisma.account.count(),
    prisma.account.count({ where: { status: "READY" } }),
    prisma.account.count({ where: { status: "BOOKED" } }),
    prisma.account.count({ where: { status: "SOLD" } }),
    prisma.inquiryLog.count(),
    prisma.account.findMany({
      take: 5,
      orderBy: { inquiryLogs: { _count: "desc" } },
      select: {
        stockId: true,
        title: true,
        priceIdr: true,
        _count: { select: { inquiryLogs: true } },
      },
    }),
  ]);

  const cards = [
    { label: "Kategori game", value: games },
    { label: "Total stok", value: accounts },
    { label: "Ready", value: ready },
    { label: "Booked", value: booked },
    { label: "Terjual", value: sold },
    { label: "Klik CTA tercatat", value: inquiries },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Ringkasan</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Kondisi katalog dan minat pembeli saat ini.
        </p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => (
          <li
            key={card.label}
            className="rounded-card border border-line/70 bg-surface/50 p-4"
          >
            <p className="text-[11px] text-ink-muted">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{card.value}</p>
          </li>
        ))}
      </ul>

      <section className="rounded-card border border-line/70 bg-surface/50 p-5">
        <h2 className="text-sm font-semibold">Stok paling banyak diminati</h2>
        {topAccounts.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Belum ada data klik CTA.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line/60">
            {topAccounts.map((account) => (
              <li
                key={account.stockId}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
              >
                <span className="min-w-0">
                  <span className="font-mono text-[11px] text-ink-muted">
                    #{account.stockId}
                  </span>
                  <span className="ml-2 text-ink">{account.title}</span>
                </span>
                <span className="text-xs text-ink-muted">
                  {account._count.inquiryLogs} klik · Rp{" "}
                  {toIdrNumber(account.priceIdr).toLocaleString("id-ID")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

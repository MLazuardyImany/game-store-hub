import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/currency";
import type { CatalogItem } from "@/lib/queries";

const STATUS_STYLE: Record<CatalogItem["status"], { label: string; className: string }> = {
  READY: { label: "READY", className: "bg-accent-emerald/15 text-accent-emerald ring-accent-emerald/40" },
  BOOKED: { label: "BOOKED", className: "bg-amber-400/15 text-amber-300 ring-amber-400/40" },
  SOLD: { label: "TERJUAL", className: "bg-accent-danger/15 text-accent-danger ring-accent-danger/40" },
};

const SPEC_ORDER = ["Rank Saat Ini", "Level", "Jumlah Skin", "Jumlah Hero", "Win Rate"];

function specPills(specs: Record<string, unknown>): string[] {
  const entries = Object.entries(specs).map(([key, value]) => `${key}: ${String(value)}`);

  return entries
    .sort((a, b) => {
      const ai = SPEC_ORDER.findIndex((prefix) => a.startsWith(prefix));
      const bi = SPEC_ORDER.findIndex((prefix) => b.startsWith(prefix));
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .slice(0, 3);
}

/** Kartu stok akun untuk grid katalog (PRD 03 §2). */
export function AccountCard({ item }: { item: CatalogItem }) {
  const isSold = item.status === "SOLD";
  const status = STATUS_STYLE[item.status];

  return (
    <Link
      href={`/account/${item.stockId}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line/70 bg-surface/60 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-glow-accent"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-backdrop">
        {item.primaryImageUrl ? (
          <Image
            src={item.primaryImageUrl}
            alt={`Screenshot ${item.title}`}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition duration-300 group-hover:scale-[1.03]",
              isSold && "grayscale opacity-55",
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <ImageOff className="size-8" aria-hidden />
            <span className="sr-only">Belum ada screenshot</span>
          </div>
        )}

        <span
          className={cn(
            "absolute top-3 left-3 rounded-pill px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1",
            status.className,
          )}
        >
          {status.label}
        </span>

        {isSold ? (
          <span className="absolute inset-0 grid place-items-center">
            <span className="rounded-lg bg-accent-danger px-4 py-1.5 text-sm font-bold tracking-widest text-white shadow-lg">
              TERJUAL
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-ink-muted uppercase">
            {item.gameName}
          </p>
          <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-ink">
            {item.title}
          </h3>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {specPills(item.specs).map((pill) => (
            <li
              key={pill}
              className="rounded-pill border border-line/70 bg-backdrop/60 px-2 py-0.5 text-[11px] text-ink-muted"
            >
              {pill}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            <p className="text-[11px] text-ink-muted">Harga</p>
            <p
              className={cn(
                "text-base font-semibold",
                isSold ? "text-ink-muted line-through" : "text-accent-emerald",
              )}
            >
              {formatRupiah(item.priceIdr)}
            </p>
          </div>
          <span className="rounded-lg border border-line/70 px-3 py-1.5 text-xs text-ink-muted transition group-hover:border-accent/50 group-hover:text-ink">
            Lihat detail
          </span>
        </div>
      </div>
    </Link>
  );
}

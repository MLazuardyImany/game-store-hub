import Link from "next/link";
import { Gamepad2, Search, Sparkles } from "lucide-react";

/** Header sticky dengan pencarian global (PRD 03 §1). */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-obsidian/85 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
            <Gamepad2 className="size-5 text-accent" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-wide">Game Store Hub</span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 text-sm sm:order-2 sm:w-auto sm:ml-4">
          <Link
            href="/catalog"
            className="rounded-lg px-3 py-2 text-ink-muted transition hover:bg-surface/70 hover:text-ink"
          >
            Katalog
          </Link>
          <Link
            href="/boosting"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-ink-muted transition hover:bg-surface/70 hover:text-ink"
          >
            <Sparkles className="size-4" aria-hidden />
            Jasa Boosting
          </Link>
        </nav>

        <form action="/catalog" className="order-2 ml-auto flex min-w-0 flex-1 sm:order-3 sm:max-w-xs">
          <label htmlFor="q" className="sr-only">
            Cari akun atau ID stok
          </label>
          <div className="flex w-full items-center gap-2 rounded-pill border border-line bg-surface/70 px-3 py-2 focus-within:border-accent/60">
            <Search className="size-4 shrink-0 text-ink-muted" aria-hidden />
            <input
              id="q"
              name="search"
              type="search"
              placeholder="Cari skin, rank, atau ID stok"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted/70"
            />
          </div>
        </form>
      </div>
    </header>
  );
}

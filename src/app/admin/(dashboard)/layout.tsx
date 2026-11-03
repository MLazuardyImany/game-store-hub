import Link from "next/link";
import { BarChart3, Boxes, LayoutDashboard, Swords, Tags } from "lucide-react";

import { LogoutButton } from "@/components/admin/logout-button";
import { requireAdmin } from "@/lib/auth";

/**
 * Halaman admin butuh cookie sesi sehingga tidak bisa di-prerender.
 * `instant = false` mengizinkan route memblokir sampai sesi diperiksa.
 */
export const instant = false;

const NAV = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/accounts", label: "Stok Akun", icon: Boxes },
  { href: "/admin/categories", label: "Kategori", icon: Tags },
  { href: "/admin/boosting", label: "Tarif Boosting", icon: Swords },
  { href: "/admin/analytics", label: "Analitik", icon: BarChart3 },
];

/** Guard sesi untuk seluruh halaman dashboard (PRD 06 §1). */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line/70 bg-backdrop/60">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="text-sm font-semibold">
            Admin · Game Store Hub
          </Link>
          <span className="rounded-pill border border-line px-2 py-0.5 text-[11px] text-ink-muted">
            {session.sub}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="text-xs text-ink-muted transition hover:text-ink">
              Lihat toko
            </Link>
            <LogoutButton />
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs text-ink-muted transition hover:bg-surface/70 hover:text-ink"
            >
              <Icon className="size-3.5" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

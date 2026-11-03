import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { whatsAppNumber } from "@/lib/cta";

/** Dihitung sekali saat modul dimuat, bukan di dalam render (aman untuk prerender). */
const CURRENT_YEAR = new Date().getFullYear();

/** Footer: garansi, ketentuan singkat, dan tautan kanal (PRD 03 §1). */
export function SiteFooter() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME;
  const discord = process.env.NEXT_PUBLIC_DISCORD_URL;

  return (
    <footer className="mt-20 border-t border-line/70 bg-backdrop/40">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-accent-emerald" aria-hidden />
            Garansi &amp; Keamanan
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Semua akun dicek manual sebelum tayang. Garansi unbind berlaku sesuai
            status binding yang tertulis di halaman stok — tanpa klaim berlebihan.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Ketentuan Singkat</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-muted">
            <li>Pembayaran dilakukan langsung dengan admin toko.</li>
            <li>Harga tercantum dalam Rupiah dan dapat berubah tanpa pemberitahuan.</li>
            <li>Rekber hanya melalui kanal resmi yang tertera di halaman ini.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Kanal Resmi</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {whatsapp ? (
              <li>
                <a
                  className="text-ink-muted transition hover:text-accent-emerald"
                  href={`https://wa.me/${whatsAppNumber()}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  WhatsApp
                </a>
              </li>
            ) : null}
            {telegram ? (
              <li>
                <a
                  className="text-ink-muted transition hover:text-accent"
                  href={`https://t.me/${telegram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Telegram
                </a>
              </li>
            ) : null}
            {discord ? (
              <li>
                <a
                  className="text-ink-muted transition hover:text-accent-violet"
                  href={discord}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Discord
                </a>
              </li>
            ) : null}
            <li>
              <Link className="text-ink-muted transition hover:text-ink" href="/boosting">
                Kalkulator Boosting
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/60 px-4 py-5 text-center text-xs text-ink-muted sm:px-6">
        © {CURRENT_YEAR} Game Store Hub. Harga dalam Rupiah (IDR).
      </div>
    </footer>
  );
}

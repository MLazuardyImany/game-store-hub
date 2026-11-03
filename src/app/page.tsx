import { BadgeCheck, Gamepad2, ShieldCheck, Zap } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "100% Aman",
    body: "Setiap akun dicek manual sebelum tampil di katalog.",
  },
  {
    icon: BadgeCheck,
    title: "Garansi Unbind",
    body: "Status binding ditulis apa adanya, tanpa klaim berlebihan.",
  },
  {
    icon: Zap,
    title: "Respon Cepat",
    body: "Order langsung tersambung ke WhatsApp admin toko.",
  },
] as const;

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      {/* Dekorasi latar: grid halus + dua glow aksen. */}
      <div
        aria-hidden
        className="bg-grid-faint pointer-events-none absolute inset-0 -z-10 opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 -z-10 h-[520px] w-[820px] max-w-none -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -bottom-56 -z-10 size-[420px] rounded-full bg-accent-emerald/10 blur-[120px]"
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-5 py-16 sm:px-8 sm:py-24">
        <header className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
            <Gamepad2 className="size-6 text-accent" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-wide text-ink">
            Game Store Hub
          </span>
        </header>

        <p className="mt-12 inline-flex w-fit items-center gap-2 rounded-pill border border-line/80 bg-surface/60 px-3.5 py-1.5 text-xs font-medium text-ink-muted">
          <span className="size-1.5 rounded-full bg-accent-emerald" aria-hidden />
          Katalog Akun &amp; Jasa Boosting
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">
          Stok akun game terverifikasi,{" "}
          <span className="text-accent">joki</span> dengan harga transparan.
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
          Lihat screenshot asli dan spesifikasi tiap akun, lalu hitung estimasi
          biaya boosting secara real-time dalam Rupiah. Semua tanpa perlu
          mendaftar akun.
        </p>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-card border border-line/70 bg-surface/60 p-5 shadow-card backdrop-blur-sm"
            >
              <Icon className="size-5 text-accent" aria-hidden />
              <h2 className="mt-4 text-sm font-semibold text-ink">{title}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                {body}
              </p>
            </li>
          ))}
        </ul>

        <footer className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line/60 pt-6 text-xs text-ink-muted">
          <span>Next.js 16 · Tailwind CSS v4 · TypeScript</span>
          <span>Harga dalam Rupiah (IDR)</span>
        </footer>
      </div>
    </main>
  );
}

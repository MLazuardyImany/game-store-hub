"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LockKeyhole } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok || !data.success) {
        setError(data.error ?? `Login gagal (${response.status}).`);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Tidak bisa menghubungi server. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  const field =
    "min-h-11 w-full rounded-lg border border-line bg-backdrop/70 px-3 text-sm text-ink outline-none focus:border-accent/60";

  return (
    <main className="grid min-h-dvh place-items-center bg-obsidian px-4">
      <div className="w-full max-w-sm rounded-card border border-line/70 bg-surface/70 p-6 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent/15 ring-1 ring-accent/30">
            <LockKeyhole className="size-5 text-accent" aria-hidden />
          </span>
          <div>
            <h1 className="text-sm font-semibold">Dashboard Admin</h1>
            <p className="text-[11px] text-ink-muted">Game Store Hub</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-[11px] text-ink-muted">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className={field}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-[11px] text-ink-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={field}
              required
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-accent-danger/40 bg-accent-danger/10 p-2.5 text-xs text-accent-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-obsidian transition hover:bg-accent/90 disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {pending ? "Memeriksa…" : "Masuk"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-ink-muted">
          Maksimal 5 percobaan per 15 menit.{" "}
          <Link href="/" className="underline">
            Kembali ke toko
          </Link>
        </p>
      </div>
    </main>
  );
}

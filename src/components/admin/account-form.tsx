"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Star, Trash2, UploadCloud, X } from "lucide-react";

export interface AccountFormInitial {
  id: string;
  stockId: string;
  gameId: string;
  title: string;
  priceIdr: number;
  status: "READY" | "BOOKED" | "SOLD";
  description: string;
  specs: Array<{ key: string; value: string }>;
  images: Array<{ url: string; isPrimary: boolean }>;
}

interface GameOption {
  id: string;
  name: string;
}

const FIELD =
  "min-h-11 w-full rounded-lg border border-line bg-backdrop/70 px-3 text-sm text-ink outline-none focus:border-accent/60";

export function AccountForm({
  games,
  initial,
}: {
  games: GameOption[];
  initial?: AccountFormInitial;
}) {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [stockId, setStockId] = useState(initial?.stockId ?? "");
  const [gameId, setGameId] = useState(initial?.gameId ?? games[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [priceIdr, setPriceIdr] = useState(String(initial?.priceIdr ?? ""));
  const [status, setStatus] = useState<AccountFormInitial["status"]>(initial?.status ?? "READY");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(
    initial?.specs.length ? initial.specs : [{ key: "Rank Saat Ini", value: "" }],
  );
  const [images, setImages] = useState<Array<{ url: string; isPrimary: boolean }>>(
    initial?.images ?? [],
  );
  const [manualUrl, setManualUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function updateSpec(index: number, patch: Partial<{ key: string; value: string }>) {
    setSpecs((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)),
    );
  }

  function addImage(url: string) {
    if (!url.trim()) return;
    setImages((current) => {
      if (current.some((image) => image.url === url)) return current;
      const next = [...current, { url: url.trim(), isPrimary: current.length === 0 }];
      return next;
    });
  }

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setError(null);
    setNotice(null);

    const form = new FormData();
    form.set("folder", "accounts");
    for (const file of list) form.append("files", file);

    try {
      const response = await fetch("/api/v1/admin/upload", { method: "POST", body: form });
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: Array<{ url: string; bytes: number }>;
      };

      if (!response.ok || !data.success || !data.data) {
        setError(data.error ?? "Upload gagal.");
        return;
      }

      setImages((current) => {
        const next = [...current];
        for (const item of data.data!) {
          if (!next.some((image) => image.url === item.url)) {
            next.push({ url: item.url, isPrimary: next.length === 0 });
          }
        }
        return next;
      });
      setNotice(`${data.data.length} gambar diunggah & dikompres ke WebP.`);
    } catch {
      setError("Tidak bisa mengunggah. Periksa koneksi lalu coba lagi.");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const payload = {
      stockId: stockId.trim().toUpperCase(),
      gameId,
      title: title.trim(),
      priceIdr: Number(priceIdr.replace(/[^\d]/g, "")),
      status,
      description: description.trim() || null,
      specs: Object.fromEntries(
        specs
          .map((row) => [row.key.trim(), row.value.trim()] as const)
          .filter(([key, value]) => key.length > 0 && value.length > 0),
      ),
      images: images.map((image) => ({ url: image.url, isPrimary: image.isPrimary })),
    };

    try {
      const response = await fetch(
        initial ? `/api/v1/admin/accounts/${initial.id}` : "/api/v1/admin/accounts",
        {
          method: initial ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !data.success) {
        setError(data.error ?? "Gagal menyimpan stok.");
        return;
      }

      router.push("/admin/accounts");
      router.refresh();
    } catch {
      setError("Tidak bisa menyimpan. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!initial) return;
    if (!window.confirm("Hapus stok ini beserta gambarnya? Tindakan tidak bisa dibatalkan.")) {
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`/api/v1/admin/accounts/${initial.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? "Gagal menghapus.");
        return;
      }
      router.push("/admin/accounts");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 rounded-card border border-line/70 bg-surface/50 p-5 sm:grid-cols-2">
        <div>
          <label htmlFor="stockId" className="mb-1.5 block text-[11px] text-ink-muted">
            ID stok
          </label>
          <input
            id="stockId"
            value={stockId}
            onChange={(event) => setStockId(event.target.value)}
            placeholder="STOK-ML-104"
            className={FIELD}
            required
          />
        </div>

        <div>
          <label htmlFor="gameId" className="mb-1.5 block text-[11px] text-ink-muted">
            Game
          </label>
          <select
            id="gameId"
            value={gameId}
            onChange={(event) => setGameId(event.target.value)}
            className={FIELD}
            required
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="title" className="mb-1.5 block text-[11px] text-ink-muted">
            Judul stok
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="MLBB Mythic 100 Skin Collector"
            className={FIELD}
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="mb-1.5 block text-[11px] text-ink-muted">
            Harga (Rp)
          </label>
          <input
            id="price"
            value={priceIdr}
            onChange={(event) => setPriceIdr(event.target.value)}
            inputMode="numeric"
            placeholder="1250000"
            className={FIELD}
            required
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1.5 block text-[11px] text-ink-muted">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value as AccountFormInitial["status"])}
            className={FIELD}
          >
            <option value="READY">Ready</option>
            <option value="BOOKED">Booked</option>
            <option value="SOLD">Terjual</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1.5 block text-[11px] text-ink-muted">
            Deskripsi
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            className="w-full rounded-lg border border-line bg-backdrop/70 p-3 text-sm text-ink outline-none focus:border-accent/60"
          />
        </div>
      </div>

      <section className="rounded-card border border-line/70 bg-surface/50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Spesifikasi dinamis</h2>
          <button
            type="button"
            onClick={() => setSpecs((current) => [...current, { key: "", value: "" }])}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs text-ink-muted hover:text-ink"
          >
            <Plus className="size-3.5" aria-hidden />
            Tambah baris
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {specs.map((row, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={row.key}
                onChange={(event) => updateSpec(index, { key: event.target.value })}
                placeholder="Level"
                className={FIELD}
              />
              <input
                value={row.value}
                onChange={(event) => updateSpec(index, { value: event.target.value })}
                placeholder="100"
                className={FIELD}
              />
              <button
                type="button"
                onClick={() =>
                  setSpecs((current) => current.filter((_, rowIndex) => rowIndex !== index))
                }
                className="grid size-11 shrink-0 place-items-center rounded-lg border border-line text-ink-muted hover:text-accent-danger"
                aria-label="Hapus baris"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-line/70 bg-surface/50 p-5">
        <h2 className="text-sm font-semibold">Screenshot</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Gambar dikompres ke WebP (maks 1920px, kualitas 80%) sebelum diunggah ke R2.
        </p>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void uploadFiles(event.dataTransfer.files);
          }}
          className="mt-3 grid place-items-center gap-2 rounded-xl border border-dashed border-line/80 p-6 text-center"
        >
          <UploadCloud className="size-6 text-ink-muted" aria-hidden />
          <p className="text-xs text-ink-muted">Tarik gambar ke sini atau pilih berkas</p>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-xs font-semibold text-obsidian disabled:opacity-60"
          >
            {uploading ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
            {uploading ? "Mengunggah…" : "Pilih berkas"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            hidden
            onChange={(event) => {
              if (event.target.files) void uploadFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="Atau tempel URL gambar (http… atau /mock/…)"
            className={FIELD}
          />
          <button
            type="button"
            onClick={() => {
              addImage(manualUrl);
              setManualUrl("");
            }}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-xs text-ink-muted hover:text-ink"
          >
            <ImagePlus className="size-3.5" aria-hidden />
            Tambah
          </button>
        </div>

        {notice ? <p className="mt-3 text-xs text-accent-emerald">{notice}</p> : null}

        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <li
              key={image.url + index}
              className="overflow-hidden rounded-lg border border-line/70 bg-backdrop"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2">
                <button
                  type="button"
                  onClick={() =>
                    setImages((current) =>
                      current.map((item, itemIndex) => ({
                        ...item,
                        isPrimary: itemIndex === index,
                      })),
                    )
                  }
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                    image.isPrimary
                      ? "bg-accent/15 text-accent"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <Star className="size-3" aria-hidden />
                  {image.isPrimary ? "Utama" : "Jadikan utama"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setImages((current) => {
                      const next = current.filter((_, itemIndex) => itemIndex !== index);
                      if (next.length > 0 && !next.some((item) => item.isPrimary)) {
                        next[0] = { ...next[0]!, isPrimary: true };
                      }
                      return next;
                    })
                  }
                  className="grid size-7 place-items-center rounded-md text-ink-muted hover:text-accent-danger"
                  aria-label="Hapus gambar"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {error ? (
        <p className="rounded-lg border border-accent-danger/40 bg-accent-danger/10 p-3 text-sm text-accent-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || uploading}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-obsidian transition hover:bg-accent/90 disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {initial ? "Simpan perubahan" : "Simpan stok"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/accounts")}
          className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 text-sm text-ink-muted hover:text-ink"
        >
          Batal
        </button>

        {initial ? (
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={pending}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg border border-accent-danger/40 px-4 text-sm text-accent-danger disabled:opacity-60"
          >
            <Trash2 className="size-4" aria-hidden />
            Hapus stok
          </button>
        ) : null}
      </div>
    </form>
  );
}

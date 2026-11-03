"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  isPrimary: boolean;
}

/** Galeri screenshot dengan lightbox (zoom, keyboard, dan swipe) — PRD 04 §1. */
export function ImageGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [index, setIndex] = useState(() => {
    const primary = images.findIndex((image) => image.isPrimary);
    return primary >= 0 ? primary : 0;
  });
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const touchStart = useRef<number | null>(null);

  const total = images.length;
  const active = images[index];

  const go = useCallback(
    (direction: 1 | -1) => {
      setIndex((current) => (current + direction + total) % total);
      setZoom(1);
    },
    [total],
  );

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  if (total === 0) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-card border border-dashed border-line/70 text-sm text-ink-muted">
        Screenshot belum diunggah
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative block aspect-[4/3] w-full overflow-hidden rounded-card border border-line/70 bg-backdrop"
      >
        <Image
          src={active.url}
          alt={`Screenshot ${index + 1} dari ${total} — ${title}`}
          fill
          unoptimized
          priority
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover"
        />
        <span className="absolute right-3 bottom-3 rounded-pill bg-obsidian/80 px-3 py-1 text-[11px] text-ink-muted">
          Klik untuk memperbesar
        </span>
      </button>

      {total > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, imageIndex) => (
            <li key={image.url + imageIndex}>
              <button
                type="button"
                onClick={() => {
                  setIndex(imageIndex);
                  setZoom(1);
                }}
                aria-current={imageIndex === index}
                className={cn(
                  "relative block size-20 shrink-0 overflow-hidden rounded-lg border transition",
                  imageIndex === index
                    ? "border-accent ring-1 ring-accent/40"
                    : "border-line/70 opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri ${title}`}
          className="fixed inset-0 z-50 flex flex-col bg-obsidian/95 backdrop-blur"
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            const end = event.changedTouches[0]?.clientX;
            if (start !== null && end !== undefined) {
              const delta = end - start;
              if (Math.abs(delta) > 48) go(delta < 0 ? 1 : -1);
            }
            touchStart.current = null;
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 text-sm text-ink-muted">
            <span>
              {index + 1} / {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
                className="grid size-11 place-items-center rounded-lg hover:bg-surface/70"
                aria-label="Perkecil"
              >
                <Minus className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setZoom((value) => Math.min(3, Number((value + 0.25).toFixed(2))))}
                className="grid size-11 place-items-center rounded-lg hover:bg-surface/70"
                aria-label="Perbesar"
              >
                <Plus className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-lg hover:bg-surface/70"
                aria-label="Tutup galeri"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="relative flex-1 overflow-auto p-4">
            <div
              className="mx-auto max-w-5xl transition-transform"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center top" }}
            >
              <Image
                src={active.url}
                alt={`Screenshot ${index + 1} — ${title}`}
                width={1600}
                height={1200}
                unoptimized
                className="h-auto w-full rounded-lg"
              />
            </div>
          </div>

          {total > 1 ? (
            <div className="flex items-center justify-center gap-4 pb-6">
              <button
                type="button"
                onClick={() => go(-1)}
                className="grid size-12 place-items-center rounded-full bg-surface/80 hover:bg-surface"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="size-6" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="grid size-12 place-items-center rounded-full bg-surface/80 hover:bg-surface"
                aria-label="Berikutnya"
              >
                <ChevronRight className="size-6" aria-hidden />
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

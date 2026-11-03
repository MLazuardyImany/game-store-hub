"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

type Status = "READY" | "BOOKED" | "SOLD";

const NEXT: Status[] = ["READY", "SOLD", "BOOKED"];

/** Toggle status cepat pada tabel stok (PRD 06 §3). */
export function StatusToggle({ id, status }: { id: string; status: Status }) {
  const router = useRouter();
  const [current, setCurrent] = useState<Status>(status);
  const [pending, setPending] = useState(false);

  async function cycle() {
    const next = NEXT[(NEXT.indexOf(current) + 1) % NEXT.length]!;
    setPending(true);

    try {
      const response = await fetch(`/api/v1/admin/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });

      if (!response.ok) return;

      setCurrent(next);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const style =
    current === "READY"
      ? "bg-accent-emerald/15 text-accent-emerald ring-accent-emerald/40"
      : current === "BOOKED"
        ? "bg-amber-400/15 text-amber-300 ring-amber-400/40"
        : "bg-accent-danger/15 text-accent-danger ring-accent-danger/40";

  return (
    <button
      type="button"
      onClick={() => void cycle()}
      disabled={pending}
      title="Klik untuk mengganti status"
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-pill px-2.5 text-[11px] font-semibold ring-1 transition disabled:opacity-60 ${style}`}
    >
      {pending ? <Loader2 className="size-3 animate-spin" aria-hidden /> : null}
      {current}
    </button>
  );
}

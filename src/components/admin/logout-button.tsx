"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch("/api/v1/admin/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={pending}
      className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-line px-3 text-xs text-ink-muted transition hover:border-accent-danger/50 hover:text-accent-danger disabled:opacity-60"
    >
      <LogOut className="size-3.5" aria-hidden />
      {pending ? "Keluar…" : "Keluar"}
    </button>
  );
}

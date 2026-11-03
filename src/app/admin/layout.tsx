import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin Game Store Hub" },
  robots: { index: false, follow: false },
};

/** Kerangka /admin. Guard sesi ada di layout grup (dashboard). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}

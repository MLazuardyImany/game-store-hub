import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const SITE_NAME = "Game Store Hub";
const SITE_DESCRIPTION =
  "Katalog akun game online dengan screenshot asli dan status binding jelas, plus kalkulator estimasi biaya jasa boosting dalam Rupiah. Tanpa perlu daftar akun.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Katalog Akun Game & Jasa Boosting`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "akun game",
    "jasa boosting",
    "joki game",
    "Mobile Legends",
    "Valorant",
    "Genshin Impact",
    "Free Fire",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#090d16",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className="flex min-h-dvh flex-col bg-obsidian text-ink antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

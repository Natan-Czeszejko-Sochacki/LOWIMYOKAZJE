import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/SiteShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ŁowimyOkazje.pl — Porównywarka cen wędkarskich",
    template: "%s | ŁowimyOkazje.pl",
  },
  description:
    "Porównuj ceny sprzętu wędkarskiego w 16 polskich sklepach. Wędki, kołowrotki, przynęty — znajdź najlepszą okazję.",
  keywords: [
    "wędkarstwo",
    "porównywarka cen",
    "sklep wędkarski",
    "promocje wędkarskie",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}

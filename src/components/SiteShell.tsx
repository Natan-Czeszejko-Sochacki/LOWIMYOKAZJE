"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { HomeCategoryBar } from "@/components/HomeCategoryBar";
import { Footer } from "@/components/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/administratorpanel");

  if (isAdmin) {
    return <>{children}</>;
  }

  const isHome = pathname === "/";

  return (
    <>
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="relative z-20">
          <Header />
        </div>
        {isHome && (
          <div className="relative z-10">
            <HomeCategoryBar />
          </div>
        )}
      </div>
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

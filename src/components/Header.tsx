"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartButton } from "@/components/CartButton";
import { GlobalSearchForm } from "@/components/catalog/GlobalSearchForm";

const navLinks = [
  { href: "/sklepy", label: "Sklepy" },
  { href: "/kategorie", label: "Kategorie" },
  { href: "/zaloguj-sie", label: "Zaloguj się" },
] as const;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
        </>
      )}
    </svg>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="border-b border-water-700 bg-white/95 backdrop-blur-md">
      <div className="safe-area-x mx-auto max-w-7xl px-2 sm:px-3">
        {/* Mobile: logo + cart + menu */}
        <div className="flex h-14 items-center justify-between gap-2 md:hidden">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src="/LOGO.png"
              alt="ŁowimyOkazje"
              className="h-10 w-auto max-w-[200px] object-contain"
            />
          </Link>
          <div className="flex items-center gap-1">
            <CartButton compact />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-2 text-water-400 hover:bg-water-900 hover:text-accent-500"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Mobile: search */}
        <div className="pb-3 md:hidden">
          <GlobalSearchForm
            showIcon
            inputClassName="w-full rounded-xl border border-water-700 bg-white py-2.5 pl-10 pr-[4.75rem] text-base text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            buttonClassName="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-400"
            placeholder="Szukaj sprzętu…"
          />
        </div>

        {/* Desktop: logo + search + nav in one row */}
        <div className="hidden h-20 items-center gap-4 md:flex">
          <Link href="/" className="flex shrink-0 items-center">
            <img
              src="/LOGO.png"
              alt="ŁowimyOkazje"
              className="h-16 w-auto max-w-[360px] object-contain lg:h-20 lg:max-w-[520px]"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <GlobalSearchForm
              showIcon
              inputClassName="w-full rounded-xl border border-water-700 bg-white py-2.5 pl-10 pr-24 text-sm text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 lg:py-3"
              buttonClassName="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-400 sm:text-sm"
              placeholder="Szukaj sprzętu…"
            />
          </div>

          <nav className="flex shrink-0 items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-water-400 hover:bg-water-900 hover:text-accent-500"
              >
                {link.label}
              </Link>
            ))}
            <CartButton />
          </nav>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            aria-label="Zamknij menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="fixed inset-x-0 top-[calc(3.5rem+3.25rem)] z-50 max-h-[calc(100dvh-3.5rem-3.25rem)] overflow-y-auto border-b border-water-700 bg-white px-4 py-3 shadow-lg md:hidden"
          >
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-water-400 hover:bg-water-900 hover:text-accent-500"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/koszyk"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-water-400 hover:bg-water-900 hover:text-accent-500"
                >
                  Koszyk
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}

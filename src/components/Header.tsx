import Link from "next/link";
import { CartButton } from "@/components/CartButton";

export function Header() {
  return (
    <header className="border-b border-water-700 bg-white/95 backdrop-blur-md">
      <div className="flex h-20 w-full items-center justify-between px-2 sm:px-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <img
            src="/LOGO.png"
            alt="ŁowimyOkazje"
            className="h-20 w-auto max-w-[520px] object-contain"
          />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/kategorie"
            className="rounded-lg px-3 py-2 text-sm font-medium text-water-400 hover:bg-water-900 hover:text-accent-500"
          >
            Kategorie
          </Link>
          <Link
            href="/sklepy"
            className="rounded-lg px-3 py-2 text-sm font-medium text-water-400 hover:bg-water-900 hover:text-accent-500"
          >
            Sklepy
          </Link>
          <Link
            href="/zaloguj-sie"
            className="rounded-lg px-3 py-2 text-sm font-medium text-water-400 hover:bg-water-900 hover:text-accent-500"
          >
            Zaloguj się
          </Link>
          <CartButton />
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { CartButton } from "@/components/CartButton";
import { GlobalSearchForm } from "@/components/catalog/GlobalSearchForm";

export function Header() {
  return (
    <header className="border-b border-water-700 bg-white/95 backdrop-blur-md">
      <div className="flex h-20 w-full flex-wrap items-center justify-between gap-2 px-2 sm:flex-nowrap sm:px-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <img
            src="/LOGO.png"
            alt="ŁowimyOkazje"
            className="h-14 w-auto max-w-[280px] object-contain sm:h-20 sm:max-w-[520px]"
          />
        </Link>

        <div className="order-3 w-full min-w-0 flex-1 px-0 sm:order-2 sm:max-w-xl sm:px-4">
          <GlobalSearchForm
            showIcon
            inputClassName="w-full rounded-xl border border-water-700 bg-white py-2.5 pl-10 pr-24 text-sm text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            buttonClassName="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-400 sm:text-sm"
            placeholder="Szukaj sprzętu…"
          />
        </div>

        <nav className="order-2 flex shrink-0 items-center gap-1 sm:order-3 sm:gap-2">
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

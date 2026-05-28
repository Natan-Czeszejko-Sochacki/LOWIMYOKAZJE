import Link from "next/link";
import { stores } from "@/lib/stores";

const STORE_COUNT = stores.length;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-water-700 bg-water-900">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <p className="text-lg font-bold text-foreground">ŁowimyOkazje.pl</p>
            <p className="mt-2 text-sm leading-relaxed text-water-400">
              Nie jesteśmy sklepem — jesteśmy wyszukiwarką, która dobiera najlepsze ceny
              z {STORE_COUNT} największych sklepów wędkarskich na rynku. Porównujemy oferty
              i kierujemy Cię do sprawdzonych sprzedawców, u których finalizujesz zakup.
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-water-300">Nawigacja</p>
            <ul className="mt-3 space-y-2 text-sm text-water-400">
              <li>
                <Link href="/kategorie" className="hover:text-accent-500">
                  Wszystkie kategorie
                </Link>
              </li>
              <li>
                <Link href="/sklepy" className="hover:text-accent-500">
                  Sklepy partnerskie
                </Link>
              </li>
              <li>
                <Link href="/regulamin" className="hover:text-accent-500">
                  Regulamin serwisu
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-accent-500">
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-water-700 pt-6 text-center text-xs text-water-500">
          © {new Date().getFullYear()} ŁowimyOkazje.pl
        </p>
      </div>
    </footer>
  );
}

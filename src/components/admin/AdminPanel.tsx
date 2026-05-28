"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  AdminOverview,
  MultiStoreProduct,
} from "@/lib/admin-stats";
import { formatPrice } from "@/lib/price-engine";

const AUTH_KEY = "admin-panel-session";

type Props = {
  overview: AdminOverview;
  products: MultiStoreProduct[];
  filteredCount: number;
  minStores: number;
  maxStores: number;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-water-700 bg-white p-4 shadow-sm">
      <p className="text-sm text-water-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">
        {typeof value === "number" ? value.toLocaleString("pl-PL") : value}
      </p>
      {hint && <p className="mt-1 text-xs text-water-500">{hint}</p>}
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-water-700 bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent-950 text-2xl">
            🔐
          </span>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Panel administratora
          </h1>
          <p className="mt-2 text-sm text-water-400">
            Logowanie będzie podpięte później. Na razie formularz jest
            wizualny — kliknij „Wejdź do panelu”, aby monitorować oferty.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-sm font-medium text-water-400"
            >
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              placeholder="admin@lowimyokazje.pl"
              className="w-full rounded-xl border border-water-700 bg-water-900 px-4 py-2.5 text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-water-400"
            >
              Hasło
            </label>
            <input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-water-700 bg-water-900 px-4 py-2.5 text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-accent-500 py-3 font-semibold text-white hover:bg-accent-400"
          >
            Wejdź do panelu
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-water-500">
          <Link href="/" className="hover:text-accent-500">
            ← Wróć na stronę główną
          </Link>
        </p>
      </div>
    </div>
  );
}

export function AdminPanel({
  overview,
  products,
  filteredCount,
  minStores,
  maxStores,
}: Props) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem(AUTH_KEY) === "1");
    setReady(true);
  }, []);

  const handleLogin = () => {
    sessionStorage.setItem(AUTH_KEY, "1");
    setAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
  };

  const applyFilter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const min = Math.max(1, Number(fd.get("minStores")) || 2);
    const max = Math.min(20, Number(fd.get("maxStores")) || 20);
    const params = new URLSearchParams();
    params.set("min", String(Math.min(min, max)));
    params.set("max", String(Math.max(min, max)));
    router.push(`/administratorpanel?${params.toString()}`);
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-water-400">
        Ładowanie panelu…
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const maxDistribution = Math.max(
    ...overview.storeCountDistribution.map((b) => b.productCount),
    1
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-water-700 pb-6">
        <div>
          <p className="text-sm font-medium text-accent-500">Administrator</p>
          <h1 className="text-3xl font-bold text-foreground">Monitor ofert</h1>
          <p className="mt-1 text-water-400">
            Produkty z wieloma opcjami zakupu w porównywanych sklepach
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-lg border border-water-700 px-4 py-2 text-sm text-water-400 hover:bg-water-900"
          >
            Strona główna
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-water-700 px-4 py-2 text-sm text-water-400 hover:bg-water-900"
          >
            Wyloguj
          </button>
        </div>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Grupy produktów" value={overview.totalGroups} />
        <StatCard label="Wszystkie oferty" value={overview.totalListings} />
        <StatCard
          label="Aktywne oferty (cena + dostępność)"
          value={overview.inStockListings}
        />
        <StatCard
          label="Produkty z >1 sklepem"
          value={overview.multiStoreProducts}
          hint="Więcej niż jedna opcja zakupu"
        />
      </section>

      {overview.lastSync && (
        <p className="mb-8 text-sm text-water-500">
          Ostatnia synchronizacja:{" "}
          {new Date(overview.lastSync).toLocaleString("pl-PL")}
        </p>
      )}

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-water-700 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Oferty wg sklepu
          </h2>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {overview.storeBreakdown.map((s) => (
              <div
                key={s.storeId}
                className="flex items-center justify-between rounded-lg bg-water-900 px-3 py-2 text-sm"
              >
                <span className="text-water-300">{s.storeName}</span>
                <span className="font-mono text-accent-500">
                  {s.count.toLocaleString("pl-PL")}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-water-700 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Produkty wg liczby sklepów
          </h2>
          <p className="mb-4 text-sm text-water-400">
            Ile produktów ma dokładnie N różnych sklepów z aktywną ofertą
          </p>
          <div className="space-y-2">
            {overview.storeCountDistribution.map((b) => (
              <div key={b.storeCount} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-water-400">
                  {b.storeCount}{" "}
                  {b.storeCount === 1 ? "sklep" : b.storeCount < 5 ? "sklepy" : "sklepów"}
                </span>
                <div className="relative h-6 flex-1 overflow-hidden rounded bg-water-800">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-accent-500"
                    style={{
                      width: `${(b.productCount / maxDistribution) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-sm text-foreground">
                  {b.productCount.toLocaleString("pl-PL")}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-water-700 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Oferty wielosklepowe
            </h2>
            <p className="mt-1 text-sm text-water-400">
              Znaleziono{" "}
              <strong className="text-accent-500">
                {filteredCount.toLocaleString("pl-PL")}
              </strong>{" "}
              produktów z {minStores}–{maxStores} sklepami
            </p>
          </div>

          <form
            onSubmit={applyFilter}
            className="flex flex-wrap items-end gap-3"
          >
            <div>
              <label
                htmlFor="minStores"
                className="mb-1 block text-xs text-water-400"
              >
                Min. sklepów
              </label>
              <input
                id="minStores"
                name="minStores"
                type="number"
                min={1}
                max={20}
                defaultValue={minStores}
                className="w-20 rounded-lg border border-water-700 bg-water-900 px-3 py-2 text-sm text-foreground"
              />
            </div>
            <div>
              <label
                htmlFor="maxStores"
                className="mb-1 block text-xs text-water-400"
              >
                Max. sklepów
              </label>
              <input
                id="maxStores"
                name="maxStores"
                type="number"
                min={1}
                max={20}
                defaultValue={maxStores}
                className="w-20 rounded-lg border border-water-700 bg-water-900 px-3 py-2 text-sm text-foreground"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-400"
            >
              Filtruj
            </button>
          </form>
        </div>

        {products.length === 0 ? (
          <p className="rounded-xl border border-water-700 bg-water-900 p-8 text-center text-water-400">
            Brak produktów spełniających kryteria ({minStores}–{maxStores}{" "}
            sklepów).
          </p>
        ) : (
          <>
            {filteredCount > products.length && (
              <p className="mb-4 text-sm text-water-500">
                Wyświetlono pierwsze {products.length} z{" "}
                {filteredCount.toLocaleString("pl-PL")} wyników.
              </p>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-water-700 text-water-400">
                    <th className="px-3 py-3 font-semibold">Produkt</th>
                    <th className="px-3 py-3 font-semibold">Sklepy</th>
                    <th className="px-3 py-3 font-semibold">Oferty</th>
                    <th className="px-3 py-3 font-semibold">Cena min</th>
                    <th className="px-3 py-3 font-semibold">Cena max</th>
                    <th className="px-3 py-3 font-semibold">Oszczędność</th>
                    <th className="px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-water-700 hover:bg-water-900"
                    >
                      <td className="max-w-xs px-3 py-3">
                        <p className="font-medium text-foreground line-clamp-2">
                          {p.name}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-accent-950 px-2.5 py-0.5 font-mono text-xs text-accent-500">
                          {p.storeCount}
                        </span>
                        <p className="mt-1 text-xs text-water-500 line-clamp-2">
                          {p.storeNames.join(", ")}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-mono text-water-400">
                        {p.offerCount}
                      </td>
                      <td className="px-3 py-3 font-medium text-emerald-600">
                        {formatPrice(p.minPrice)}
                      </td>
                      <td className="px-3 py-3 text-water-400">
                        {formatPrice(p.maxPrice)}
                      </td>
                      <td className="px-3 py-3 text-accent-500">
                        {p.savings > 0 ? formatPrice(p.savings) : "—"}
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/produkt/${p.slug}`}
                          className="whitespace-nowrap text-accent-500 hover:text-accent-400"
                          target="_blank"
                        >
                          Zobacz →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  cartTotals,
  getCartItemKey,
  onCartChange,
  readCart,
  removeCartItem,
  clearCart,
  replaceCart,
  setCartItemQuantity,
} from "@/lib/cart";
import { formatPrice } from "@/lib/price-engine";

const DELIVERY_PER_STORE = 10;

function normalizeStoreKey(storeId?: string, storeName?: string): string {
  const base = (storeId?.trim() || storeName?.trim() || "").toLowerCase();
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type OptimizationResponse = {
  ok: boolean;
  currentTotal: number;
  optimizedTotal: number;
  savings: number;
  currentStoreCount: number;
  optimizedStoreCount: number;
  hasBetterOption: boolean;
  recommendations: Array<{
    productId: string;
    productName: string;
    quantity: number;
    currentStoreId: string | null;
    currentStoreName: string;
    currentUnitPrice: number;
    recommendedStoreId: string;
    recommendedStoreName: string;
    recommendedUnitPrice: number;
    recommendedUrl: string;
    changed: boolean;
  }>;
};

export default function CartPage() {
  const [items, setItems] = useState<ReturnType<typeof readCart>>([]);
  const [optimization, setOptimization] = useState<OptimizationResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    return onCartChange(sync);
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      setOptimization(null);
      return;
    }

    let aborted = false;
    setIsOptimizing(true);

    fetch("/api/cart/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, deliveryPerStore: DELIVERY_PER_STORE }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return (await res.json()) as OptimizationResponse;
      })
      .then((data) => {
        if (!aborted) setOptimization(data);
      })
      .catch(() => {
        if (!aborted) setOptimization(null);
      })
      .finally(() => {
        if (!aborted) setIsOptimizing(false);
      });

    return () => {
      aborted = true;
    };
  }, [items]);

  const totals = useMemo(() => cartTotals(items), [items]);
  const groupedByStore = useMemo(() => {
    const groups = new Map<string, { storeName: string; items: typeof items }>();
    for (const item of items) {
      const key = normalizeStoreKey(item.storeId, item.storeName);
      const existing = groups.get(key);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.set(key, { storeName: item.storeName, items: [item] });
      }
    }
    return [...groups.entries()].map(([key, group]) => [key, group.storeName, group.items] as const);
  }, [items]);
  const totalDelivery = groupedByStore.length * DELIVERY_PER_STORE;
  const totalWithDelivery = totals.amount + totalDelivery;

  const applyOptimizedCart = () => {
    if (!optimization?.ok || !optimization.hasBetterOption) return;
    const byProductId = new Map(optimization.recommendations.map((r) => [r.productId, r]));
    const updated = items.map((item) => {
      const rec = byProductId.get(item.productId);
      if (!rec) return item;
      return {
        ...item,
        storeId: rec.recommendedStoreId,
        storeName: rec.recommendedStoreName,
        price: rec.recommendedUnitPrice,
        url: rec.recommendedUrl || item.url,
      };
    });
    replaceCart(updated);
    setItems(updated);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Koszyk</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-water-500">
          Koszyk jest pusty. <Link href="/" className="text-accent-500 hover:underline">Wróć do ofert</Link>.
        </p>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {groupedByStore.map(([storeKey, storeName, storeItems]) => {
              const storeSubtotal = storeItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );
              const storeTotal = storeSubtotal + DELIVERY_PER_STORE;

              return (
                <section
                  key={storeKey}
                  className="rounded-xl border border-water-700 bg-white p-4"
                >
                  <h2 className="text-lg font-bold text-foreground">{storeName}</h2>
                  <div className="mt-3 space-y-3">
                    {storeItems.map((item) => (
                      <div
                        key={getCartItemKey(item)}
                        className="flex flex-col gap-3 rounded-xl border border-water-700 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 flex-none rounded-lg border border-water-700 bg-water-900 object-cover"
                          />
                          <div className="min-w-0">
                            <Link
                              href={`/produkt/${item.slug}`}
                              className="line-clamp-2 font-semibold text-foreground hover:text-accent-500 hover:underline"
                            >
                              {item.name}
                            </Link>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="text-xs text-water-500">Ilość:</span>
                              <div className="inline-flex items-center rounded-lg border border-water-700">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCartItemQuantity(item, item.quantity - 1)
                                  }
                                  className="h-8 w-8 text-sm text-water-500 hover:bg-water-900"
                                  aria-label={`Zmniejsz ilość ${item.name}`}
                                >
                                  −
                                </button>
                                <span className="min-w-8 border-x border-water-700 px-2 text-center text-sm font-medium text-foreground">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCartItemQuantity(item, item.quantity + 1)
                                  }
                                  className="h-8 w-8 text-sm text-water-500 hover:bg-water-900"
                                  aria-label={`Zwiększ ilość ${item.name}`}
                                >
                                  +
                                </button>
                              </div>
                              <span className="text-sm text-water-500">
                                × {formatPrice(item.price)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-medium text-foreground">
                              Razem: {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 rounded-lg bg-accent-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-accent-400 sm:flex-none"
                          >
                            Kup teraz
                          </a>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item)}
                            className="rounded-lg border border-water-700 px-3 py-2 text-sm text-water-500 hover:bg-water-900"
                          >
                            Usuń
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-t border-water-700 pt-3 text-sm">
                    <p className="text-water-500">
                      Suma produktów: <span className="font-medium text-foreground">{formatPrice(storeSubtotal)}</span>
                    </p>
                    <p className="text-water-500">
                      Dostawa: <span className="font-medium text-foreground">{formatPrice(DELIVERY_PER_STORE)}</span>
                    </p>
                    <p className="mt-1 font-semibold text-foreground">
                      Razem ({storeName}): <span className="text-accent-500">{formatPrice(storeTotal)}</span>
                    </p>
                  </div>
                </section>
              );
            })}
          </div>

          <section className="mt-6 rounded-xl border border-water-700 bg-white p-4">
            <h2 className="text-lg font-bold text-foreground">Sugestia oszczędniejszego zakupu</h2>
            {isOptimizing && <p className="mt-2 text-sm text-water-500">Liczenie najlepszej kombinacji...</p>}
            {!isOptimizing && optimization?.ok && optimization.hasBetterOption && (
              <>
                <p className="mt-2 text-sm text-water-500">
                  Obecny koszyk: {formatPrice(optimization.currentTotal)} ({optimization.currentStoreCount} sklepów)
                </p>
                <p className="text-sm text-water-500">
                  Lepsza kombinacja: {formatPrice(optimization.optimizedTotal)} ({optimization.optimizedStoreCount} sklepów)
                </p>
                <p className="text-sm text-water-500">
                  Dlaczego: rozbijanie zamówienia na większą liczbę sklepów zwykle zwiększa koszt
                  przez kolejne opłaty dostawy (obecnie {formatPrice(DELIVERY_PER_STORE)} za każdy sklep).
                </p>
                <p className="mt-1 font-semibold text-emerald-600">
                  Oszczędzasz: {formatPrice(optimization.savings)}
                </p>
                <button
                  type="button"
                  onClick={applyOptimizedCart}
                  className="mt-3 rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold text-white hover:bg-accent-400"
                >
                  Zastosuj najlepszą kombinację
                </button>
                <div className="mt-3 space-y-2">
                  {optimization.recommendations
                    .filter((r) => r.changed)
                    .map((r) => (
                      <p key={r.productId} className="text-sm text-water-500">
                        <span className="font-medium text-foreground">{r.productName}</span>:{" "}
                        zamiast <strong>{r.currentStoreName}</strong> ({formatPrice(r.currentUnitPrice)}),
                        lepiej <strong>{r.recommendedStoreName}</strong> ({formatPrice(r.recommendedUnitPrice)})
                      </p>
                    ))}
                </div>
              </>
            )}
            {!isOptimizing && optimization?.ok && !optimization.hasBetterOption && (
              <p className="mt-2 text-sm text-water-500">
                Aktualny podział sklepów jest już najkorzystniejszy.
              </p>
            )}
          </section>

          <div className="mt-6 rounded-xl border border-water-700 bg-white p-4">
            <p className="text-sm text-water-500">Liczba produktów: {totals.quantity}</p>
            <p className="mt-1 text-sm text-water-500">
              Suma produktów: <span className="font-medium text-foreground">{formatPrice(totals.amount)}</span>
            </p>
            <p className="mt-1 text-sm text-water-500">
              Suma dostaw ({groupedByStore.length} sklepów):{" "}
              <span className="font-medium text-foreground">{formatPrice(totalDelivery)}</span>
            </p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              Razem do zapłaty: <span className="text-accent-500">{formatPrice(totalWithDelivery)}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => clearCart()}
                className="rounded-lg border border-water-700 px-3 py-2 text-sm text-water-500 hover:bg-water-900"
              >
                Wyczyść koszyk
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

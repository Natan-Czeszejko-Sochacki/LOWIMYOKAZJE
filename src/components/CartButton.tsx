"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  cartTotals,
  onCartChange,
  readCart,
  removeCartItem,
  setCartItemQuantity,
  getCartItemKey,
} from "@/lib/cart";
import { formatPrice } from "@/lib/price-engine";

export function CartButton() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ReturnType<typeof readCart>>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    return onCartChange(sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handleOutside);
    return () => window.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const totals = useMemo(() => cartTotals(items), [items]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-water-700 px-3 py-2 text-sm font-medium text-water-400 hover:bg-water-900 hover:text-accent-500"
      >
        🛒 Koszyk
        {totals.quantity > 0 && (
          <span className="ml-2 rounded-full bg-accent-500 px-2 py-0.5 text-xs font-semibold text-white">
            {totals.quantity}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[110] mt-2 w-80 rounded-xl border border-water-700 bg-white p-4 shadow-xl">
          <h3 className="text-sm font-semibold text-foreground">Podsumowanie koszyka</h3>
          <div className="mt-3 max-h-64 space-y-2 overflow-auto">
            {items.length === 0 ? (
              <p className="text-sm text-water-500">Koszyk jest pusty.</p>
            ) : (
              items.map((item) => (
                <div
                  key={getCartItemKey(item)}
                  className="flex items-center gap-2 rounded-lg border border-water-700 p-2"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-10 w-10 flex-none rounded-md border border-water-700 bg-water-900 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produkt/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="line-clamp-1 text-sm font-medium text-foreground hover:text-accent-500 hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="line-clamp-1 text-xs text-water-500">Sklep: {item.storeName}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCartItemQuantity(item, item.quantity - 1)
                        }
                        className="h-6 w-6 rounded border border-water-700 text-xs text-water-500 hover:bg-water-900"
                        aria-label={`Zmniejsz ilość ${item.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-xs text-water-500">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCartItemQuantity(item, item.quantity + 1)
                        }
                        className="h-6 w-6 rounded border border-water-700 text-xs text-water-500 hover:bg-water-900"
                        aria-label={`Zwiększ ilość ${item.name}`}
                      >
                        +
                      </button>
                      <span className="ml-1 text-xs text-water-500">
                        x {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCartItem(item)}
                    className="h-7 w-7 flex-none rounded border border-water-700 text-xs text-water-500 hover:bg-water-900"
                    aria-label={`Usuń ${item.name} z koszyka`}
                    title="Usuń z koszyka"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 border-t border-water-700 pt-3 text-sm">
            <p className="font-medium text-foreground">
              Suma: <span className="text-accent-500">{formatPrice(totals.amount)}</span>
            </p>
          </div>
          <Link
            href="/koszyk"
            onClick={() => setOpen(false)}
            className="mt-4 inline-flex w-full justify-center rounded-lg bg-accent-500 px-3 py-2 text-sm font-semibold text-white hover:bg-accent-400"
          >
            Przejdź do koszyka
          </Link>
        </div>
      )}
    </div>
  );
}

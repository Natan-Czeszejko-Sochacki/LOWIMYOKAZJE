"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";

type Props = {
  item: {
    productId: string;
    slug: string;
    name: string;
    image: string;
    storeId?: string;
    storeName: string;
    price: number;
    url: string;
  };
  className?: string;
};

export function AddToCartButton({ item, className }: Props) {
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addToCart(item);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Dodano do koszyka" : "Dodaj do koszyka"}
    </button>
  );
}

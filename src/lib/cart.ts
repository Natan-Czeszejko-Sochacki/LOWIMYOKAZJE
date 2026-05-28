"use client";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  storeId?: string;
  storeName: string;
  price: number;
  url: string;
  quantity: number;
};

const CART_KEY = "shopping_cart_v1";
const CART_CHANGED_EVENT = "cart:changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeStoreKey(storeId?: string, storeName?: string): string {
  const base = (storeId?.trim() || storeName?.trim() || "").toLowerCase();
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getCartItemKey(item: Pick<CartItem, "productId" | "storeId" | "storeName">): string {
  return `${item.productId}::${normalizeStoreKey(item.storeId, item.storeName)}`;
}

function sanitizeCartItems(items: CartItem[]): { items: CartItem[]; changed: boolean } {
  let changed = false;
  const merged = new Map<string, CartItem>();

  for (const raw of items) {
    if (!raw || !raw.productId || raw.quantity <= 0) {
      changed = true;
      continue;
    }

    const cleaned: CartItem = {
      ...raw,
      productId: String(raw.productId).trim(),
      slug: String(raw.slug ?? "").trim(),
      name: String(raw.name ?? "").trim(),
      image: String(raw.image ?? "").trim(),
      storeId: raw.storeId?.trim() || undefined,
      storeName: String(raw.storeName ?? "").trim(),
      price: Number(raw.price) || 0,
      url: String(raw.url ?? "").trim(),
      quantity: Math.max(1, Math.floor(Number(raw.quantity) || 1)),
    };

    if (
      cleaned.productId !== raw.productId ||
      cleaned.storeId !== raw.storeId ||
      cleaned.storeName !== raw.storeName ||
      cleaned.quantity !== raw.quantity
    ) {
      changed = true;
    }

    const key = getCartItemKey(cleaned);
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += cleaned.quantity;
      changed = true;
    } else {
      merged.set(key, cleaned);
    }
  }

  return { items: [...merged.values()], changed };
}

export function readCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    const sanitized = sanitizeCartItems(parsed);
    if (sanitized.changed) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(sanitized.items));
    }
    return sanitized.items;
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
}

export function replaceCart(items: CartItem[]) {
  writeCart(items);
}

export function onCartChange(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CART_CHANGED_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

export function cartTotals(items: CartItem[]) {
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { quantity, amount };
}

export function addToCart(item: Omit<CartItem, "quantity">, quantity = 1) {
  const items = readCart();
  const targetKey = getCartItemKey(item);
  const existing = items.find((it) => getCartItemKey(it) === targetKey);
  if (existing) {
    existing.quantity += quantity;
    writeCart(items);
    return;
  }
  writeCart([...items, { ...item, quantity }]);
}

export function setCartItemQuantity(
  item: Pick<CartItem, "productId" | "storeId" | "storeName">,
  quantity: number
) {
  const targetKey = getCartItemKey(item);
  const nextQuantity = Math.max(0, Math.floor(quantity));
  const items = readCart();
  const idx = items.findIndex((it) => getCartItemKey(it) === targetKey);
  if (idx < 0) return;
  if (nextQuantity === 0) {
    items.splice(idx, 1);
    writeCart(items);
    return;
  }
  items[idx].quantity = nextQuantity;
  writeCart(items);
}

export function removeCartItem(item: Pick<CartItem, "productId" | "storeId" | "storeName">) {
  const targetKey = getCartItemKey(item);
  const items = readCart().filter((it) => getCartItemKey(it) !== targetKey);
  writeCart(items);
}

export function removeFromCart(productId: string) {
  const items = readCart().filter((item) => item.productId !== productId);
  writeCart(items);
}

export function clearCart() {
  writeCart([]);
}

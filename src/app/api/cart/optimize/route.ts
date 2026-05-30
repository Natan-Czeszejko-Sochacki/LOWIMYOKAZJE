import { NextRequest, NextResponse } from "next/server";
import { getProductWithOffers } from "@/lib/product-cache";
import { getStoreById } from "@/lib/stores";

export const dynamic = "force-dynamic";

type CartRequestItem = {
  productId: string;
  slug: string;
  name: string;
  storeId?: string;
  storeName: string;
  price: number;
  quantity: number;
};

type Candidate = {
  storeId: string;
  storeName: string;
  unitPrice: number;
  url: string;
};

type DpState = {
  subtotal: number;
  picks: Candidate[];
};

function normalizeStoreKey(storeId?: string, storeName?: string): string {
  const base = (storeId?.trim() || storeName?.trim() || "").toLowerCase();
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function bitCount(mask: number): number {
  let count = 0;
  let value = mask;
  while (value > 0) {
    count += value & 1;
    value >>= 1;
  }
  return count;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    items?: CartRequestItem[];
    deliveryPerStore?: number;
  };

  const items = Array.isArray(body.items) ? body.items : [];
  const deliveryPerStore = Number.isFinite(body.deliveryPerStore)
    ? Number(body.deliveryPerStore)
    : 10;

  if (items.length === 0) {
    return NextResponse.json({
      ok: true,
      currentTotal: 0,
      optimizedTotal: 0,
      savings: 0,
      recommendations: [],
      hasBetterOption: false,
    });
  }

  const products = await Promise.all(
    items.map(async (item) => {
      const product = await getProductWithOffers(item.slug || item.productId);
      const offers = (product?.offers ?? [])
        .filter((o) => o.inStock && o.price > 0)
        .map((o) => ({
          storeId: o.storeId,
          storeName: getStoreById(o.storeId)?.name ?? o.storeId,
          unitPrice: o.price,
          url: o.url,
        }));

      const hasCurrentStoreCandidate = offers.some((o) =>
        normalizeStoreKey(o.storeId, o.storeName) ===
        normalizeStoreKey(item.storeId, item.storeName)
      );
      if (!hasCurrentStoreCandidate && item.storeName) {
        offers.push({
          storeId: item.storeId ?? `manual:${item.storeName}`,
          storeName: item.storeName,
          unitPrice: item.price,
          url: "",
        });
      }

      return {
        ...item,
        candidates: offers,
      };
    })
  );

  if (products.some((p) => p.candidates.length === 0)) {
    return NextResponse.json(
      { ok: false, error: "Nie udało się pobrać ofert dla wszystkich produktów." },
      { status: 400 }
    );
  }

  const allStoreIds = [...new Set(products.flatMap((p) => p.candidates.map((c) => c.storeId)))];
  if (allStoreIds.length > 30) {
    return NextResponse.json(
      { ok: false, error: "Za dużo kombinacji sklepów do optymalizacji." },
      { status: 400 }
    );
  }

  const storeIndex = new Map(allStoreIds.map((id, idx) => [id, idx]));
  let states = new Map<number, DpState>();
  states.set(0, { subtotal: 0, picks: [] });

  for (const product of products) {
    const nextStates = new Map<number, DpState>();
    for (const [mask, state] of states.entries()) {
      for (const candidate of product.candidates) {
        const idx = storeIndex.get(candidate.storeId);
        if (idx == null) continue;
        const nextMask = mask | (1 << idx);
        const nextSubtotal = state.subtotal + candidate.unitPrice * product.quantity;
        const existing = nextStates.get(nextMask);
        if (!existing || nextSubtotal < existing.subtotal) {
          nextStates.set(nextMask, {
            subtotal: nextSubtotal,
            picks: [...state.picks, candidate],
          });
        }
      }
    }
    states = nextStates;
  }

  let bestMask = 0;
  let bestTotal = Number.POSITIVE_INFINITY;
  let bestPicks: Candidate[] = [];
  for (const [mask, state] of states.entries()) {
    const total = state.subtotal + bitCount(mask) * deliveryPerStore;
    if (total < bestTotal) {
      bestTotal = total;
      bestMask = mask;
      bestPicks = state.picks;
    }
  }

  const currentStores = new Set(
    items.map((item) => normalizeStoreKey(item.storeId, item.storeName))
  );
  const currentSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currentTotal = currentSubtotal + currentStores.size * deliveryPerStore;

  const recommendations = products.map((product, idx) => {
    const best = bestPicks[idx];
    return {
      productId: product.productId,
      productName: product.name,
      quantity: product.quantity,
      currentStoreId: product.storeId ?? null,
      currentStoreName: product.storeName,
      currentUnitPrice: product.price,
      recommendedStoreId: best.storeId,
      recommendedStoreName: best.storeName,
      recommendedUnitPrice: best.unitPrice,
      recommendedUrl: best.url,
      changed:
        (product.storeId ? product.storeId !== best.storeId : product.storeName !== best.storeName) ||
        product.price !== best.unitPrice,
    };
  });

  return NextResponse.json({
    ok: true,
    deliveryPerStore,
    currentTotal,
    optimizedTotal: bestTotal,
    savings: Math.max(0, currentTotal - bestTotal),
    currentStoreCount: currentStores.size,
    optimizedStoreCount: bitCount(bestMask),
    recommendations,
    hasBetterOption: bestTotal + 0.0001 < currentTotal,
  });
}

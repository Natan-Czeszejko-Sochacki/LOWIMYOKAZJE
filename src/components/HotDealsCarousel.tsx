"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ProductWithOffers } from "@/lib/types";
import { formatPrice, getStoreNameForOffer } from "@/lib/price-engine";
import { ProductImage } from "./ProductImage";

const INTERVAL_MS = 4500;
const GAP_REM = 1; // gap-4

const sectionTitleClass =
  "text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl";

type Props = {
  deals: ProductWithOffers[];
  className?: string;
  hideHeaderOnDesktop?: boolean;
};

function getVisibleCount(width: number) {
  if (width >= 1024) return 4;
  return 2;
}

function useVisibleCount() {
  const [visible, setVisible] = useState(4);

  useEffect(() => {
    const update = () => setVisible(getVisibleCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return visible;
}

function MiniPromoWindow({ product }: { product: ProductWithOffers }) {
  const best = product.bestOffer;

  return (
    <Link
      href={`/produkt/${product.slug}`}
      className="group flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-2 border-water-600/90 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.1)] ring-1 ring-black/5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-accent-500 hover:shadow-[0_14px_32px_rgba(5,150,105,0.22)] hover:ring-2 hover:ring-accent-500/25"
    >
      <div className="relative aspect-square shrink-0 border-b-2 border-water-700/60 bg-gradient-to-b from-white to-water-900">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute right-2 top-2 rounded-lg bg-accent-500 px-2 py-1 text-[11px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(5,150,105,0.45)] sm:text-xs">
          −{product.discountPercent}%
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col bg-gradient-to-b from-white to-accent-950/30 p-2.5 sm:p-3">
        <p className="line-clamp-2 text-[11px] font-bold leading-snug text-foreground transition-colors group-hover:text-accent-600 sm:text-xs">
          {product.name}
        </p>
        {best && (
          <div className="mt-auto space-y-0.5 pt-2">
            <p className="text-base font-bold tracking-tight text-accent-600 sm:text-lg">
              {formatPrice(best.price)}
            </p>
            {best.originalPrice && best.originalPrice > best.price && (
              <p className="text-[10px] font-medium text-water-500 line-through sm:text-xs">
                {formatPrice(best.originalPrice)}
              </p>
            )}
            <p className="truncate text-[9px] font-medium text-water-400 sm:text-[10px]">
              {getStoreNameForOffer(best)}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}

function SlideDots({
  count,
  index,
  onSelect,
}: {
  count: number;
  index: number;
  onSelect: (i: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <div className="flex justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Pozycja ${i + 1}`}
          onClick={() => onSelect(i)}
          className={`h-2 rounded-full transition-all ${
            i === index ? "w-5 bg-accent-500" : "w-2 bg-water-700 hover:bg-water-600"
          }`}
        />
      ))}
    </div>
  );
}

function CarouselArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const label = direction === "prev" ? "Poprzednia oferta" : "Następna oferta";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-water-700 bg-white text-lg font-bold text-water-400 shadow-md transition-colors hover:border-accent-500/50 hover:bg-accent-950 hover:text-accent-500 disabled:pointer-events-none disabled:opacity-0 sm:h-10 sm:w-10 ${
        direction === "prev" ? "left-0 sm:-left-1" : "right-0 sm:-right-1"
      }`}
    >
      <span aria-hidden>{direction === "prev" ? "‹" : "›"}</span>
    </button>
  );
}

export function HotDealsCarousel({
  deals,
  className = "",
  hideHeaderOnDesktop = false,
}: Props) {
  const visible = useVisibleCount();
  const maxIndex = Math.max(0, deals.length - visible);
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const safeIndex = Math.min(index, maxIndex);

  indexRef.current = safeIndex;
  const canNavigate = deals.length > visible;

  const cardWidth = `calc((100% - ${(visible - 1) * GAP_REM}rem) / ${visible})`;
  const step = `calc(${cardWidth} + ${GAP_REM}rem)`;

  const jumpWithoutAnimation = useCallback((nextIndex: number) => {
    setAnimate(false);
    setIndex(nextIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
  }, []);

  const goNext = useCallback(() => {
    const current = indexRef.current;
    if (current >= maxIndex) {
      jumpWithoutAnimation(0);
      return;
    }
    setAnimate(true);
    setIndex(current + 1);
  }, [maxIndex, jumpWithoutAnimation]);

  const goPrev = useCallback(() => {
    const current = indexRef.current;
    if (current <= 0) {
      jumpWithoutAnimation(maxIndex);
      return;
    }
    setAnimate(true);
    setIndex(current - 1);
  }, [maxIndex, jumpWithoutAnimation]);

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!canNavigate) return;

    intervalRef.current = setInterval(goNext, INTERVAL_MS);
  }, [canNavigate, goNext]);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoplay]);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const handleManualNav = (action: () => void) => {
    action();
    startAutoplay();
  };

  const handleDotSelect = (i: number) => {
    setAnimate(true);
    setIndex(i);
    startAutoplay();
  };

  if (deals.length === 0) {
    return (
      <div
        className={`flex h-full items-center justify-center rounded-xl border border-water-700 bg-water-900 p-6 text-center ${className}`}
      >
        <p className="text-sm text-water-400">
          Brak promocji — pojawią się po synchronizacji cen.
        </p>
      </div>
    );
  }

  const dotCount = maxIndex + 1;

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div
        className={`mb-4 flex shrink-0 items-center justify-between gap-4 ${
          hideHeaderOnDesktop ? "lg:hidden" : ""
        }`}
      >
        <h2 className={sectionTitleClass}>Największe promocje</h2>
        <SlideDots count={dotCount} index={safeIndex} onSelect={handleDotSelect} />
      </div>

      <div className="relative min-h-0 flex-1 px-10 sm:px-12">
        <CarouselArrow
          direction="prev"
          disabled={!canNavigate}
          onClick={() => handleManualNav(goPrev)}
        />
        <CarouselArrow
          direction="next"
          disabled={!canNavigate}
          onClick={() => handleManualNav(goNext)}
        />

        <div className="overflow-hidden">
          <div
            className={`flex gap-4 ${animate ? "transition-transform duration-700 ease-in-out" : ""}`}
            style={{
              transform: `translateX(calc(-1 * ${safeIndex} * (${step})))`,
            }}
          >
            {deals.map((product) => (
              <div
                key={product.id}
                className="shrink-0"
                style={{ width: cardWidth }}
              >
                <MiniPromoWindow product={product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {hideHeaderOnDesktop && canNavigate && (
        <div className="mt-4 hidden shrink-0 lg:block">
          <SlideDots count={dotCount} index={safeIndex} onSelect={handleDotSelect} />
        </div>
      )}
    </div>
  );
}

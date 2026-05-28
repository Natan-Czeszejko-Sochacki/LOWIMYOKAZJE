"use client";

import { HOT_DEALS_SECTION_ID } from "@/lib/home-sections";

export function ScrollToHotDealsCTA() {
  const scrollToDeals = () => {
    document.getElementById(HOT_DEALS_SECTION_ID)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="flex flex-col items-center gap-3 pt-6 sm:pt-8">
      <span className="text-water-400" aria-hidden>
        <svg
          className="h-7 w-7 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </span>
      <p className="text-center text-base font-medium text-water-300 sm:text-lg">
        Sprawdź największe promocje
      </p>
      <button
        type="button"
        onClick={scrollToDeals}
        className="rounded-xl border border-water-700 bg-white/95 px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-accent-500/50 hover:bg-accent-950 hover:text-accent-500 sm:text-base"
      >
        Zobacz promocje
      </button>
    </div>
  );
}

import { GlobalSearchForm } from "@/components/catalog/GlobalSearchForm";
import { ScrollToHotDealsCTA } from "@/components/ScrollToHotDealsCTA";

const heroHighlights = [
  {
    label: "Do 70% taniej",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6" />
      </svg>
    ),
  },
  {
    label: "Wiele sklepów",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
      </svg>
    ),
  },
  {
    label: "Najniższa cena",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
] as const;

export function HomeHero() {
  return (
    <section
      className="border-b border-water-700 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/hero-bg-fishing.png')" }}
    >
      <div className="bg-gradient-to-b from-white/75 via-white/60 to-white/50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-4xl space-y-6 lg:space-y-8">
            <div className="space-y-5 sm:space-y-6">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
                Sprzęt wędkarski nawet{" "}
                <span className="box-decoration-clone rounded-md bg-emerald-800 px-2 py-0.5 text-white shadow-[0_2px_10px_rgba(0,0,0,0.35)] ring-1 ring-white/50">
                  70% taniej
                </span>
                ? Łowimy Okazje!
              </h1>
              <p className="max-w-3xl text-lg font-medium leading-relaxed text-foreground drop-shadow-[0_1px_12px_rgba(255,255,255,0.85)] sm:text-xl lg:text-2xl">
                Nie przepłacaj w pojedynczych sklepach. Wpisz nazwę produktu i zobacz, gdzie kupisz go
                najtaniej.
              </p>
              <ul className="flex flex-wrap gap-2.5 sm:gap-3" aria-label="Korzyści">
                {heroHighlights.map((item) => (
                  <li key={item.label}>
                    <span className="inline-flex items-center gap-2 rounded-full border border-water-700/80 bg-white/90 px-4 py-2 text-sm font-medium text-water-300 shadow-sm sm:text-base">
                      <span className="text-accent-500">{item.icon}</span>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <GlobalSearchForm
              showIcon
              inputClassName="w-full rounded-2xl border border-water-700 bg-white py-5 pl-14 pr-28 text-lg text-foreground shadow-md placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 sm:py-6 sm:pl-16 sm:pr-32 sm:text-xl"
              buttonClassName="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-accent-500 px-5 py-2.5 text-base font-semibold text-white hover:bg-accent-400 sm:right-3 sm:px-6 sm:py-3 sm:text-lg"
              placeholder="np. Shimano, kołowrotek, wobbler, wędka karpiowa…"
            />

            <ScrollToHotDealsCTA />
          </div>
        </div>
      </div>
    </section>
  );
}

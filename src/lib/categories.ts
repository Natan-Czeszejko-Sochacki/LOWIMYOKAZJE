import type { Category } from "./types";

export const categories: Category[] = [
  // ── Wędki ─────────────────────────────────────────────────────────────────
  {
    id: "wedki",
    slug: "wedki",
    name: "Wędki",
    description: "Wędki spinningowe, feederowe, spławikowe i karpiowe",
    icon: "🎣",
  },
  {
    id: "wedki-spinning",
    slug: "wedki-spinningowe",
    name: "Wędki spinningowe",
    description: "Wędziska do spinningu i castingu",
    icon: "🌀",
    parentId: "wedki",
  },
  {
    id: "wedki-feeder",
    slug: "wedki-feederowe",
    name: "Wędki feederowe",
    description: "Wędki do metody feeder i method",
    icon: "📡",
    parentId: "wedki",
  },
  {
    id: "wedki-spławik",
    slug: "wedki-spławikowe",
    name: "Wędki spławikowe",
    description: "Match, bolo, tyczki i wędki do spławika",
    icon: "🎯",
    parentId: "wedki",
  },
  {
    id: "wedki-karp",
    slug: "wedki-karpiowe",
    name: "Wędki karpiowe",
    description: "Wędziska karpiowe i stalkingowe",
    icon: "🐟",
    parentId: "wedki",
  },
  {
    id: "wedki-muchowe",
    slug: "wedki-muchowe",
    name: "Wędki muchowe",
    description: "Sprzęt do wędkarstwa muchowego",
    icon: "🪰",
    parentId: "wedki",
  },
  {
    id: "wedki-morskie",
    slug: "wedki-morskie",
    name: "Wędki morskie",
    description: "Wędziska surfcasting i morskie",
    icon: "🌊",
    parentId: "wedki",
  },

  // ── Kołowrotki ────────────────────────────────────────────────────────────
  {
    id: "kolowrotki",
    slug: "kolowrotki",
    name: "Kołowrotki",
    description: "Kołowrotki spinningowe, feederowe i karpiowe",
    icon: "⚙️",
  },
  {
    id: "kolowrotki-spinning",
    slug: "kolowrotki-spinningowe",
    name: "Kołowrotki spinningowe",
    description: "Kołowrotki na spinning i castings",
    icon: "⚙️",
    parentId: "kolowrotki",
  },
  {
    id: "kolowrotki-karp",
    slug: "kolowrotki-karpiowe",
    name: "Kołowrotki karpiowe",
    description: "Duże kołowrotki karpiowe i big pit",
    icon: "⚙️",
    parentId: "kolowrotki",
  },
  {
    id: "kolowrotki-feeder",
    slug: "kolowrotki-feederowe",
    name: "Kołowrotki feederowe",
    description: "Kołowrotki do feeder i match",
    icon: "⚙️",
    parentId: "kolowrotki",
  },

  // ── Przynęty ──────────────────────────────────────────────────────────────
  {
    id: "przynety",
    slug: "przynety",
    name: "Przynęty",
    description: "Przynęty sztuczne i naturalne",
    icon: "🐠",
  },
  {
    id: "przynety-sztuczne",
    slug: "przynety-sztuczne",
    name: "Przynęty sztuczne",
    description: "Woblery, gumy, błystki i główki jigowe",
    icon: "🐠",
    parentId: "przynety",
  },
  {
    id: "woblery",
    slug: "woblery",
    name: "Woblery",
    description: "Woblery, jerkbait, crankbait i poppery",
    icon: "🐟",
    parentId: "przynety-sztuczne",
  },
  {
    id: "gumy-wedkarskie",
    slug: "gumy-wedkarskie",
    name: "Gumy",
    description: "Twistery, rippery, shad i inne miękkie przynęty",
    icon: "🪱",
    parentId: "przynety-sztuczne",
  },
  {
    id: "blystki",
    slug: "blystki",
    name: "Błystki",
    description: "Obrotówki, wahadłówki, cykady i spinnerbaity",
    icon: "✨",
    parentId: "przynety-sztuczne",
  },
  {
    id: "glowki-jigowe",
    slug: "glowki-jigowe",
    name: "Główki jigowe",
    description: "Główki jigowe, pilkery i czeburaszki",
    icon: "⚫",
    parentId: "przynety-sztuczne",
  },
  {
    id: "inne-przynety-sztuczne",
    slug: "inne-przynety-sztuczne",
    name: "Inne przynęty sztuczne",
    description: "Jigi, cykady i przynęty sztuczne bez osobnej grupy",
    icon: "🐠",
    parentId: "przynety-sztuczne",
  },
  {
    id: "przynety-naturalne",
    slug: "przynety-naturalne",
    name: "Przynęty naturalne",
    description: "Robaki, kukurydza, ziarna i gotowe naturalne przynęty",
    icon: "🌽",
    parentId: "przynety",
  },

  // ── Zanęty ────────────────────────────────────────────────────────────────
  {
    id: "zanety",
    slug: "zanety-i-kulki",
    name: "Zanęty",
    description: "Zanęty, pellet, kulki i dodatki zanętowe",
    icon: "⚪",
  },
  {
    id: "zanety-pellety",
    slug: "zanety-pellety",
    name: "Pellety",
    description: "Pellet zanętowy, expander i micro",
    icon: "⚪",
    parentId: "zanety",
  },
  {
    id: "zanety-sypkie",
    slug: "zanety-sypkie",
    name: "Zanęty sypkie",
    description: "Zanęty sypkie, groundbait i mieszanki bazowe",
    icon: "⚪",
    parentId: "zanety",
  },
  {
    id: "zanety-method",
    slug: "zanety-method",
    name: "Method",
    description: "Mieszanki method, stick mix i zanęty do koszyka",
    icon: "🧺",
    parentId: "zanety",
  },
  {
    id: "zanety-dodatki",
    slug: "zanety-dodatki",
    name: "Dodatki zanętowe",
    description: "Atraktory, oleje, syropy i dodatki do zanęty",
    icon: "💧",
    parentId: "zanety",
  },
  {
    id: "kulki-proteinowe",
    slug: "kulki-proteinowe",
    name: "Kulki proteinowe",
    description: "Boilies, pop-up, wafters i kulki proteinowe",
    icon: "🟠",
    parentId: "zanety",
  },
  {
    id: "odzywki",
    slug: "odzywki-i-dipy",
    name: "Dipy i odżywki",
    description: "Dipy, boostery i dipy do kulki",
    icon: "💧",
    parentId: "zanety",
  },
  {
    id: "karmniki",
    slug: "karmniki-i-zanety-karpiowe",
    name: "Karmniki i zanęty karpiowe",
    description: "Karmniki, spody, rakiety PVA",
    icon: "🚀",
    parentId: "zanety",
  },

  // ── Żyłki ─────────────────────────────────────────────────────────────────
  {
    id: "zylki",
    slug: "zylki-i-plecionki",
    name: "Żyłki",
    description: "Żyłki, plecionki, fluoro i przypony",
    icon: "🧵",
  },
  {
    id: "zylki-plecionki",
    slug: "zylki-plecionki",
    name: "Plecionki",
    description: "Plecionki spinningowe, karpiowe i feederowe",
    icon: "🧵",
    parentId: "zylki",
  },
  {
    id: "zylki-fluorocarbon",
    slug: "zylki-fluorocarbon",
    name: "Fluorocarbon",
    description: "Żyłki i przypony fluorocarbonowe",
    icon: "🧵",
    parentId: "zylki",
  },
  {
    id: "zylki-monofilament",
    slug: "zylki-monofilament",
    name: "Monofilament",
    description: "Żyłki mono i nylonowe",
    icon: "🧵",
    parentId: "zylki",
  },
  {
    id: "przypony",
    slug: "przypony",
    name: "Przypony",
    description: "Przypony stalowe, tytanowe i fluorocarbonowe",
    icon: "🔗",
    parentId: "zylki",
  },

  // ── Haczyki i montaż ──────────────────────────────────────────────────────
  {
    id: "haczyki",
    slug: "haczyki",
    name: "Haczyki",
    description: "Haczyki pojedyncze, zestawy i montaże",
    icon: "🪝",
  },
  {
    id: "haczyki-stare",
    slug: "haczyki-i-przypony",
    name: "Haczyki i przypony",
    description: "Haczyki, klipsy i elementy montażowe",
    icon: "🪝",
  },

  // ── Spławik ───────────────────────────────────────────────────────────────
  {
    id: "splawiki",
    slug: "splawiki",
    name: "Spławiki",
    description: "Spławiki wagowe, waggler i antenna",
    icon: "🔴",
  },
  {
    id: "splawiki-pojedyncze",
    slug: "splawiki-pojedyncze",
    name: "Spławiki pojedyncze",
    description: "Spławiki przelotowe, stałe, wagglery i antenki",
    icon: "🔴",
    parentId: "splawiki",
  },
  {
    id: "zestawy-spławik",
    slug: "zestawy-spławikowe",
    name: "Zestawy spławikowe",
    description: "Gotowe zestawy do spławika",
    icon: "📦",
    parentId: "splawiki",
  },

  // ── Feeder / method ─────────────────────────────────────────────────────────
  {
    id: "feeder",
    slug: "sprzet-feeder-i-method",
    name: "Sprzęt feeder i method",
    description: "Koszyki, podajniki i akcesoria feeder",
    icon: "🧺",
  },
  {
    id: "koszyki-zanetowe",
    slug: "koszyki-zanetowe",
    name: "Koszyki zanętowe",
    description: "Koszyki feeder, method i bomb",
    icon: "🧺",
    parentId: "feeder",
  },
  {
    id: "akcesoria-feeder-method",
    slug: "akcesoria-feeder-method",
    name: "Akcesoria feeder",
    description: "Foremki, łączniki i drobne akcesoria feeder/method",
    icon: "🧺",
    parentId: "feeder",
  },

  // ── Ciężarki ──────────────────────────────────────────────────────────────
  {
    id: "ciezarki",
    slug: "ciezarki",
    name: "Ciężarki",
    description: "Ciężarki ołowiane, karpowe i do method",
    icon: "⬇️",
  },

  // ── Elektronika ─────────────────────────────────────────────────────────────
  {
    id: "elektronika",
    slug: "elektronika-wedkarska",
    name: "Elektronika",
    description: "Echosondy, sygnalizatory, kamery i GPS",
    icon: "📡",
  },
  {
    id: "sygnalizatory-brania",
    slug: "sygnalizatory-brania",
    name: "Sygnalizatory brań",
    description: "Sygnalizatory, swingery, buzzery i hanger",
    icon: "🔔",
    parentId: "elektronika",
  },
  {
    id: "latarki-wedkarskie",
    slug: "latarki-wedkarskie",
    name: "Latarki",
    description: "Latarki czołowe i kątowe wędkarskie",
    icon: "🔦",
    parentId: "elektronika",
  },
  {
    id: "echosondy-gps",
    slug: "echosondy-i-gps",
    name: "Echosondy i GPS",
    description: "Echosondy, sonary, kamery i nawigacja",
    icon: "📡",
    parentId: "elektronika",
  },

  // ── Namioty i biwak ───────────────────────────────────────────────────────
  {
    id: "namioty",
    slug: "namioty-wedkarskie",
    name: "Namioty",
    description: "Namioty, parasole, śpiwory i maty",
    icon: "⛺",
  },
  {
    id: "namioty-parasole",
    slug: "namioty-parasole",
    name: "Parasole",
    description: "Parasole wędkarskie i brolly",
    icon: "☂️",
    parentId: "namioty",
  },
  {
    id: "namioty-spiwory-maty",
    slug: "namioty-spiwory-maty",
    name: "Śpiwory i maty",
    description: "Maty karpiowe, śpiwory i lozka wędkarskie",
    icon: "🛏️",
    parentId: "namioty",
  },
  {
    id: "namioty-sheltery",
    slug: "namioty-i-sheltery",
    name: "Namioty i sheltery",
    description: "Namioty, bivvy, shelter i narzuty",
    icon: "⛺",
    parentId: "namioty",
  },
  {
    id: "stoliki-biwakowe",
    slug: "stoliki-biwakowe",
    name: "Stoliki biwakowe",
    description: "Stoliki i wyposażenie biwakowe",
    icon: "⛺",
    parentId: "namioty",
  },

  // ── Akcesoria karpiowe / biwak ────────────────────────────────────────────
  {
    id: "karp-akcesoria",
    slug: "akcesoria-karpiowe",
    name: "Akcesoria karpiowe",
    description: "Podpórki, kołyski, maty i akcesoria karpiowe",
    icon: "🏕️",
  },
  {
    id: "podporki-wedki",
    slug: "podporki-wedki",
    name: "Podpórki",
    description: "Podpórki, banksticki i rod pod",
    icon: "🦯",
    parentId: "karp-akcesoria",
  },
  {
    id: "krzesla-wedkarskie",
    slug: "krzesla-wedkarskie",
    name: "Krzesła wędkarskie",
    description: "Fotele, krzesła i leżanki wędkarskie",
    icon: "🪑",
    parentId: "karp-akcesoria",
  },
  {
    id: "drobne-akcesoria-karpiowe",
    slug: "drobne-akcesoria-karpiowe",
    name: "Drobne akcesoria karpiowe",
    description: "Markery, opaski, stojaki, wiadra i wyposażenie karpiowe",
    icon: "🏕️",
    parentId: "karp-akcesoria",
  },

  // ── Odzież ─────────────────────────────────────────────────────────────────
  {
    id: "odziez",
    slug: "odziez-wedkarska",
    name: "Odzież wędkarska",
    description: "Kurtki, spodnie, polar i odzież techniczna",
    icon: "🧥",
  },
  {
    id: "obuwie",
    slug: "obuwie-wedkarskie",
    name: "Buty wędkarskie",
    description: "Buty, kalosze i wodery",
    icon: "👢",
    parentId: "odziez",
  },
  {
    id: "odziez-czapki",
    slug: "odziez-czapki-rekawice",
    name: "Czapki i rękawice",
    description: "Czapki, kominy, buffy i rękawice",
    icon: "🧤",
    parentId: "odziez",
  },
  {
    id: "odziez-okulary",
    slug: "odziez-okulary",
    name: "Okulary",
    description: "Okulary polaryzacyjne wędkarskie",
    icon: "🕶️",
    parentId: "odziez",
  },
  {
    id: "odziez-kurtki-spodnie",
    slug: "odziez-kurtki-spodnie",
    name: "Kurtki i spodnie",
    description: "Kurtki, spodnie, bluzy, koszulki i bielizna techniczna",
    icon: "🧥",
    parentId: "odziez",
  },

  // ── Torby i organizacja ───────────────────────────────────────────────────
  {
    id: "transport",
    slug: "transport-i-torby",
    name: "Transport i torby",
    description: "Torby, plecaki i pokrowce wędkarskie",
    icon: "🎒",
  },
  {
    id: "torby-plecaki",
    slug: "torby-plecaki",
    name: "Plecaki",
    description: "Plecaki i torby wędkarskie",
    icon: "🎒",
    parentId: "transport",
  },
  {
    id: "torby-wedkarskie",
    slug: "torby-wedkarskie",
    name: "Torby wędkarskie",
    description: "Torby, carryalle, worki i pokrowce transportowe",
    icon: "🎒",
    parentId: "transport",
  },
  {
    id: "pokrowce-wedkarskie",
    slug: "pokrowce-wedkarskie",
    name: "Pokrowce",
    description: "Pokrowce na wędki, kołowrotki i sprzęt",
    icon: "🎒",
    parentId: "transport",
  },
  {
    id: "pojemniki",
    slug: "pojemniki-i-organizacja",
    name: "Pojemniki i organizacja",
    description: "Pudełka, boxy i organizery",
    icon: "🗃️",
  },

  // ── Narzędzia ───────────────────────────────────────────────────────────────
  {
    id: "narzedzia",
    slug: "narzedzia-wedkarskie",
    name: "Narzędzia",
    description: "Podbieraki, szczypce, noże i ważki",
    icon: "🔧",
  },
  {
    id: "podbieraki",
    slug: "podbieraki",
    name: "Podbieraki",
    description: "Podbieraki teleskopowe i główki",
    icon: "🥅",
    parentId: "narzedzia",
  },
  {
    id: "narzedzia-drobne",
    slug: "narzedzia-drobne",
    name: "Narzędzia drobne",
    description: "Szczypce, igły, noże, wagi i akcesoria narzędziowe",
    icon: "🔧",
    parentId: "narzedzia",
  },

  // ── Akcesoria ogólne ────────────────────────────────────────────────────────
  {
    id: "akcesoria-wedkarskie",
    slug: "akcesoria-wedkarskie",
    name: "Akcesoria wędkarskie",
    description: "Akcesoria i drobny montaż wędkarski",
    icon: "🧰",
  },
  {
    id: "kretliki-agrafki",
    slug: "kretliki-i-agrafki",
    name: "Krętliki i agrafki",
    description: "Krętliki, agrafki, szybkozłączki i łączniki",
    icon: "🧰",
    parentId: "akcesoria-wedkarskie",
  },
  {
    id: "stopery-klipsy",
    slug: "stopery-i-klipsy",
    name: "Stopery i klipsy",
    description: "Stopery, klipsy, rurki, koraliki i elementy montażowe",
    icon: "🧰",
    parentId: "akcesoria-wedkarskie",
  },
  {
    id: "szpule-czesci",
    slug: "szpule-i-czesci",
    name: "Szpule i części",
    description: "Szpule zapasowe, przelotki i części serwisowe",
    icon: "🧰",
    parentId: "akcesoria-wedkarskie",
  },
  {
    id: "pozostale-akcesoria",
    slug: "pozostale-akcesoria-wedkarskie",
    name: "Pozostałe akcesoria",
    description: "Pozostałe drobne akcesoria wędkarskie",
    icon: "🧰",
    parentId: "akcesoria-wedkarskie",
  },

  // ── Sumowe ──────────────────────────────────────────────────────────────────
  {
    id: "sprzet-sumowy",
    slug: "sprzet-sumowy",
    name: "Sprzęt sumowy",
    description: "Przynęty, haczyki i sprzęt na suma i sandacza",
    icon: "🐋",
  },

  // ── Pozostałe (poza menu, nadal w katalogu) ─────────────────────────────────
  {
    id: "pontony",
    slug: "pontony-i-lodzie",
    name: "Pontony i łodzie",
    description: "Pontony, łodzie, silniki i wiosła",
    icon: "🛶",
  },
  {
    id: "lodz-silniki",
    slug: "silniki-elektryczne",
    name: "Silniki elektryczne",
    description: "Silniki do pontonów i łodzi",
    icon: "⚡",
    parentId: "pontony",
  },
  {
    id: "lodzie-pontony",
    slug: "lodzie-i-pontony",
    name: "Łodzie i pontony",
    description: "Pontony, łodzie i kajaki wędkarskie",
    icon: "🛶",
    parentId: "pontony",
  },
  {
    id: "hamulce",
    slug: "hamulce-lodzkie",
    name: "Hamulce i kotwice",
    description: "Kotwice, cumy i akcesoria łodziowe",
    icon: "⚓",
    parentId: "pontony",
  },
  {
    id: "bezpieczenstwo",
    slug: "bezpieczenstwo-nad-woda",
    name: "Bezpieczeństwo nad wodą",
    description: "Kapoki, apteczki i oświetlenie",
    icon: "🦺",
  },
  {
    id: "zestawy",
    slug: "zestawy-wedkarskie",
    name: "Zestawy wędkarskie",
    description: "Kompletne zestawy dla początkujących",
    icon: "🎁",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

/** Szuka kategorii po slug lub id (category_id w bazie to slug) */
export function resolveCategory(ref: string): Category | undefined {
  return getCategoryBySlug(ref) ?? getCategoryById(ref);
}

export function getRootCategories(): Category[] {
  return categories.filter((c) => !c.parentId);
}

export function getChildCategories(parentId: string): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}

/** Wszystkie slugi kategorii potomnych (rekurencyjnie) */
export function getCategoryDescendantSlugs(slug: string): Set<string> {
  const cat = getCategoryBySlug(slug);
  const slugs = new Set<string>([slug]);
  if (!cat) return slugs;

  for (const child of categories.filter((c) => c.parentId === cat.id)) {
    for (const s of getCategoryDescendantSlugs(child.slug)) {
      slugs.add(s);
    }
  }
  return slugs;
}

/** Głębokość w drzewie — 0 dla korzenia, 1 dla podkategorii itd. */
export function getCategoryDepth(ref: string): number {
  const cat = resolveCategory(ref);
  if (!cat) return 0;

  let depth = 0;
  let parentId = cat.parentId;
  while (parentId) {
    depth++;
    const parent = categories.find((c) => c.id === parentId);
    parentId = parent?.parentId;
  }
  return depth;
}

/**
 * Wybiera najbardziej szczegółową kategorię spośród zapisanej w DB
 * i wnioskowanych z nazw produktu / listingów (np. karpiowy vs ogólne kołowrotki).
 */
export function resolveProductCategorySlug(
  stored: string | null | undefined,
  ...names: string[]
): string {
  const candidates = new Set<string>();

  if (stored && stored !== "inne") candidates.add(stored);

  for (const name of names) {
    const trimmed = name?.trim();
    if (!trimmed) continue;
    const directCategory = resolveCategory(trimmed);
    if (directCategory) candidates.add(directCategory.slug);
    candidates.add(inferCategorySlug(trimmed));
  }

  const valid = [...candidates].filter((c) => c && c !== "inne" && resolveCategory(c));
  if (valid.length === 0) {
    const fallback = names.find((n) => n?.trim());
    return fallback ? inferCategorySlug(fallback) : "inne";
  }

  const preferredName = names[0]?.trim();
  const preferredDirect = preferredName ? resolveCategory(preferredName) : null;
  const preferred = preferredName
    ? preferredDirect?.slug ?? inferCategorySlug(preferredName)
    : null;
  const deepestDepth = Math.max(...valid.map(getCategoryDepth));
  if (
    preferred &&
    valid.includes(preferred) &&
    getCategoryDepth(preferred) >= deepestDepth
  )
    return preferred;

  return valid.reduce((best, cur) =>
    getCategoryDepth(cur) > getCategoryDepth(best) ? cur : best
  );
}

export { categoryNavGroups, categoryNavStandalone } from "./category-nav";

function plToAscii(s: string): string {
  return s
    .toLowerCase()
    .replace(/&amp;(?:amp;)?/g, " ")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/ą/g, "a").replace(/ć/g, "c").replace(/ę/g, "e")
    .replace(/ł/g, "l").replace(/ń/g, "n").replace(/ó/g, "o")
    .replace(/ś/g, "s").replace(/ź/g, "z").replace(/ż/g, "z")
    .replace(/\s+/g, " ");
}

/** Klasyfikacja produktu po nazwie — logika wędkarska, kolejność reguł ma znaczenie */
export function inferCategorySlug(name: string): string {
  const t = plToAscii(name);

  // ── Torby / pokrowce — przed wędkami i haczykami ───────────────────────────
  if (/\bplecak\b|plecak (wedkarski|karpiowy|carp)|\bplecak\b.*wedkarsk/.test(t))
    return "torby-plecaki";
  if (/pokrowiec|rod sleeve|futerak/.test(t)) return "pokrowce-wedkarskie";
  if (
    /torba\b|\bbag\b|carryall|holdall|\bpouch\b|\bworek\b|\bsling\b|rod bag|walizka wedkarska/.test(t) &&
    !/zaneta|zanety|groundbait|bag mix|bait mix/.test(t)
  )
    return "torby-wedkarskie";

  if (/szpula|spool|przelotk|czesc zamienna|zapasow[ay]/.test(t))
    return "szpule-i-czesci";

  if (/podpork[ai]|bankstick|rod pod|\brod rest\b|monopod|glowica zaciskowa|stojak na wedk/.test(t))
    return "podporki-wedki";

  // ── Kołowrotki (z podtypem) ───────────────────────────────────────────────
  if (/kolowrotk|kolowrotek|kolowrotki|\breel\b|multiplikator|multipikator|muliplikator|kołowrotek/.test(t)) {
    if (/sum\b|suma\b|sumowy|wels|siluro|catfish|big cat|catextreme/.test(t))
      return "sprzet-sumowy";
    if (
      /feeder|match|\bpicker\b|method runner|method master|method gun|method freerunner|brain.*(classic|classic se|apex)|preston.*(centris|inertia|invictus|magnitude|extremity|intensity|magnifeeder)|matrix.*(aquos|horizon|ethos|hx)|browning|quantum code cfb|\bmap\b|leeda concept|inception|uv ii match|tubertini|trabucco|ms range|flagman|nytro/.test(
        t
      )
    )
      return "kolowrotki-feederowe";
    if (/karpiow|carp|big pit|bigpit|baitrunner|btr|woln(?:y|ym) bieg|free spool|spod|surf|long cast|distance|sls|anaconda|magist|rock hopper|fulcrum|black widow|emblem|noctis lcf|long cast carp|mantra|darx|corzar|quick shadow/.test(t))
      return "kolowrotki-karpiowe";
    if (/spinning|spin|casting|baitcast|multiplikator|\bbc\b|ninja lt|legalis|fuego|exceler|caldia|certate|luvias|prorex|ballistic|revros|crossfire|sweepfire|daiwa (ninja|legalis|fuego|exceler|caldia|certate|luvias|prorex|ballistic|bg|revros|crossfire|sweepfire)|shimano (stradic|vanford|miravel|sahara|nasci|sedona|catana|sustain|twin power|ultegra)|abu garcia|ryobi|okuma|zauber|ixpera|hexa|agon|hornet|nexton|starlight|w4-bc/.test(t))
      return "kolowrotki-spinningowe";
    return "kolowrotki-spinningowe";
  }

  // ── Żyłki — przed spinning/karp/feeder w nazwie ─────────────────────────────
  if (/\bleader\b|strzalowk|material przyponow|leadcore/.test(t))
    return "przypony";
  if (/plecionka|plecionki|\bbraid\b|8-carat|8x\b|4x\b/.test(t))
    return "zylki-plecionki";
  if (/fluorocarbon|\bfluoro\b|fc line/.test(t)) return "zylki-fluorocarbon";
  if (/monofil|mono line|\bnylon\b/.test(t)) return "zylki-monofilament";
  if (/zylka|zylki|leadcore|flyline|fly line|silk line|amortyzator|amoryzator|elastic/.test(t))
    return "zylki-monofilament";

  // ── Przynęty NATURALNE — przed haczykami i przyponami ─────────────────────
  // „Kukurydza na haczyk", „przynęta kukurydza", ziarna = naturalne, NIE haczyki
  if (
    /kukurydza|tigernuts?|tigrow|orzech tygrysi|ziarna|ziarnko|pszenica|konopie|hemp|konopne|naturalna przyneta|przyneta naturalna|robak|dzdzowni|larw[ay]|glista|robaczki|tygryski|pinki|pellet (natural|zlozone|z ziarn)|paste (natural|z ziarn)|sweetcorn|mais/.test(
      t
    )
  )
    return "przynety-naturalne";
  if (/na haczyk|na hak|hook bait|hair stop.*(kukurydz|ziarn|boili)/.test(t))
    return "przynety-naturalne";

  // ── Kulki proteinowe — przed ogólnymi zanętami ─────────────────────────────
  if (
    /boili[e]?|\bkulki\b|kulki (proteinow|zanetowe|przynetowe|dumbellsy)|dumbells?|kulki pop.?up|\bpop.?up\b|popup|wafters?|kulki\s+(banan|truskawka|scopex|pomara|chocolate|fishmeal|natural|grab|victory)|rolling table|tablica do rolowania|wiadro na kule/.test(
      t
    )
  )
    return "kulki-proteinowe";

  // ── Dipy / boostery ───────────────────────────────────────────────────────
  if (
    /\bdip\b|dipy|booster|atraktor|\baromat\b|\bdodatek\b|\batomizer\b|\bguma arabska\b|\bspray\b|spray do przynet|hookbait spray|liquid attract|spray attractant|smakolik|corn steep|hemp oil|tiger oil|corn syrop|syrop kukurydzian|syrop nectarol|glug/.test(
      t
    )
  )
    return "odzywki-i-dipy";

  // ── Pellet / zanęty ─────────────────────────────────────────────────────────
  if (/\bpellet\b|expander|micro pellet|zaneta|zanety|zanetow|groundbait|stick mix|spod mix|bait mix|lyzka zanetowa|baitspoon/.test(t)) {
    if (/koszyk|koszyczek|podajnik/.test(t)) return "koszyki-zanetowe";
    if (/\bspod\b|\bspomb\b|rakieta|karmnik/.test(t))
      return "karmniki-i-zanety-karpiowe";
    if (/method|feeder mix|foremka/.test(t)) return "zanety-method";
    if (/\bpellet\b|expander|micro/.test(t)) return "zanety-pellety";
    return "zanety-sypkie";
  }
  if (/method mix|method zaneta|zaneta method|foremka method|\bsito\b|sito do zanet|miska zanet/.test(t))
    return "zanety-method";
  if (/\bpva\b|pva mesh|pva worki|pva string|proca zanet|catapult/.test(t)) return "zanety-dodatki";

  if (/szczytowk/.test(t)) return "wedki-feederowe";

  // ── Karmniki / spody ────────────────────────────────────────────────────────
  if (/\bspod\b|\bspomb\b|rakieta(?: pva)?|karmnik karpiow/.test(t))
    return "karmniki-i-zanety-karpiowe";

  // ── Wędki ─────────────────────────────────────────────────────────────────
  if (/wedk[aie]|wedzisko|\brod\b/.test(t)) {
    if (/spinning|\bspin\b|casting|\bcast\b|lure rod|ultralight|ultalight|jig rod|spin rod|finesse|dropshot|drop shot|predator|pike|zander|aspius|chub|vendetta|veritas|beast|svartzonker|squidlaw/.test(t))
      return "wedki-spinningowe";
    if (/feeder|method feeder|\bpicker\b/.test(t)) return "wedki-feederowe";
    if (/\bmatch\b|bolonka|splawikow|telefloat|tyczk[ai]|\bpole\b|float rod|waggl/.test(t))
      return "wedki-spławikowe";
    if (/karpiow|karp rod|carp rod|stalking|\bcarp\b|\bspod\b|tribal|horizon|tx-[0-9a-z]/.test(t)) return "wedki-karpiowe";
    if (/muchow|fly rod|fly fishing/.test(t)) return "wedki-muchowe";
    if (/morsk|surfcast|boat rod|sea rod/.test(t)) return "wedki-morskie";
    return "wedki-spinningowe";
  }

  // ── Przynęty sztuczne — szczegółowe podtypy ────────────────────────────────
  if (/glowka jig|jig head|czebur|czeburask|pilker|pirker|leadhead/.test(t))
    return "glowki-jigowe";
  if (
    /wobler|wobbler|jerkbait|crankbait|minnow|popper|walk the dog|stick bait|hard lure|sinking lure|floating lure/.test(
      t
    )
  )
    return "woblery";
  if (
    /blystk[ai]|obrotow|wahadlow|spinnerbait|cykad[ay]|spoon|\btroll\b|inline spinner|spinmad|wirujacy ogonek|tail spinner/.test(
      t
    )
  )
    return "blystki";
  if (
    /\bgum[ay]\b|guma (rybna|na okon|wedkarska)|twister|ripper|shad\b|swimbait|grub\b|soft lure|przyneta gumow|d-shot|dropshot|finesse|artificial worm|worm bait|easy shiner|sicario|dolive craw|scissor comb|slim jim|ricky the roach|fishunter|makora|kukolka|turbo worm|saira|jaws|craw\b|split tail|mcbeast|shadteez/.test(
      t
    )
  )
    return "gumy-wedkarskie";
  if (/przyneta sztucz|przynety sztucz|\bprzyneta\b|lure\b|artificial bait|przyneta .*(\d+[,.]?\d*cm|\d+g|roach|perch|pike|firetiger|bleak|wakasagi)/.test(t))
    return "inne-przynety-sztuczne";

  // ── Przypony stalowe / fluoro (NIE gotowe przynęty na haczyku) ─────────────
  if (
    /\bprzypon[y]?\b|steel leader|titan leader|titanium leader|leadcore leader/.test(
      t
    )
  ) {
    if (/(kukurydz|ziarn|robak|boili|natural|sweetcorn)/.test(t))
      return "przynety-naturalne";
    return "przypony";
  }

  // ── Ciężarki — osobna kategoria ───────────────────────────────────────────
  if (
    /ciezarek|ciezarki|olowi[ae]|\bolowian|sinker|backlead|back weight|bomb lead|inline lead|flat pear|distance lead|method feeder weight|split shot/.test(
      t
    )
  )
    return "ciezarki";

  // ── Haczyki i montaż ────────────────────────────────────────────────────────
  if (
    /haczyk[i]?|\bhak\b|\bhaki\b|\bhook[s]?\b|kotwicz(?:ka|ki)|kotwica (?!wedkarska|do lodzi)|spade end|eyed hook|barbed|barbless|hair rig|d-rig|rig tool|dozbrojk|systemik do zbrojenia|montaz karpiow/.test(
      t
    )
  )
    return "haczyki";
  if (
    /kretlik|agrafk|swivel|szybkozlaczk|quick link|snap link|lacznik|laczniki|feederlink|run rings/.test(
      t
    )
  )
    return "kretliki-i-agrafki";
  if (
    /stoper|tulej[ae]|krimp|\brig\b|\bklips\b|safety clip|lead clip|bezpieczny klips|leadclip|wielosklad|gumki do zakladania przynet|pins stinger|wkretka do przynet|pozycjoner|koralik|beads?|rurk[ai]|adapter|tail rubber|anti tangle/.test(
      t
    )
  )
    return "stopery-i-klipsy";

  // ── Spławiki ────────────────────────────────────────────────────────────────
  if (/splawik|waggler|antenk[ai]|bodomer|dardex|insert splawik/.test(t))
    return "splawiki-pojedyncze";

  // ── Koszyki feeder ──────────────────────────────────────────────────────────
  if (
    /koszyk[i]?|koszyczek|koszyczkow|feeder (cage|koszyk|bomb)|method feeder|method bomb|\bbomb\b|podajnik|foremka method|wklad do koszyka|szczytowka feeder/.test(
      t
    )
  )
    return "koszyki-zanetowe";

  // ── Sygnalizatory / alarmy ──────────────────────────────────────────────────
  if (
    /sygnalizator|wskaznik bran|swinger|\bhanger\b|bobbin|bite alarm|buzzer bar|alarm bran|alarm set|buzz.?bar/.test(
      t
    )
  )
    return "sygnalizatory-brania";

  // ── Podpórki, krzesła, maty ─────────────────────────────────────────────────
  if (/podpork[ai]|bankstick|rod pod|\brod rest\b|monopod|glowica zaciskowa/.test(t))
    return "podporki-wedki";
  if (
    /\bfotel\b|fotel karpiow|fotel wedkarskie|\bchair\b|carp chair|lounge chair|bed.?chair|\bbeds?\b|\blozko\b|\bkrzeslo\b|krzeslo wedkarskie|krzeslo karpiowe/.test(
      t
    )
  )
    return "krzesla-wedkarskie";
  if (/\bmata\b|mata (karpow|do ryb|karpiow)|mata wedkarska|sleep system|spiwor|sleeping bag/.test(t))
    return "namioty-spiwory-maty";
  if (/parasol|brolly|parasol wedkarski|parasol karpiow/.test(t))
    return "namioty-parasole";
  if (/stolik|table/.test(t)) return "stoliki-biwakowe";
  if (/bivvy|\bnamiot\b|namiot (wedkarski|karpiowy|carp)/.test(t))
    return "namioty-i-sheltery";

  // ── Podbieraki ──────────────────────────────────────────────────────────────
  if (/podbierak|podbieraka|landing net|glowka podbierak|siatka podbierak|\bsztyca\b|sztyca podbierak/.test(t)) return "podbieraki";

  // ── Sum / sandacz ───────────────────────────────────────────────────────────
  if (
    /sum\b|suma\b|sumowy|wels|siluro|clonk|dead bait (sum|wels)|deadbait (sum|wels)|zander|sandacz/.test(
      t
    )
  )
    return "sprzet-sumowy";

  // ── Odzież ──────────────────────────────────────────────────────────────────
  if (/\bbuty\b|kalosze|wodery|waders|spodniobuty|obuwie wedkarsk|sandal wedkarski|skarpety/.test(t))
    return "obuwie-wedkarskie";
  if (/okulary|okulary polaryz|polarized|polaryzacyjne/.test(t)) return "odziez-okulary";
  if (/rekawiczki|rekawice|\bczapka\b|buff|komin/.test(t))
    return "odziez-czapki-rekawice";
  if (
    /kurtka|kurtki|\bspodnie\b|spodenki|\bjoggers?\b|\bshorts\b|\bbluza\b|hoody|hoodie|\bkoszulka\b|t-shirt|\btee\b|long sleeve|kombinezon|kamizelka (wedkarska|polarow)|polar|termiczn|bielizna (termiczn|termo|wedkarska)|baselayer/.test(
      t
    )
  )
    return "odziez-kurtki-spodnie";

  // ── Elektronika ─────────────────────────────────────────────────────────────
  if (/head torch|latarka czolowa|latarka czołowa|headlamp|\blatarka\b|\blampa\b|armytek|wizard c2/.test(t))
    return "latarki-wedkarskie";
  if (
    /echosond[ay]|sonar|kamera podwod|kamera na ryb|gps nawigac|gps wedkarski|autopilot gps|akumulator wedkarski|ladowarka wedkarska/.test(
      t
    )
  )
    return "echosondy-i-gps";

  // ── Pontony ─────────────────────────────────────────────────────────────────
  if (/\bponton\b|ponton wedkarski|lodz wedkarska|kajak wedkarski|silnik elektryczny do pontonu|wiosla wedkarsk|kotwica wedkarska/.test(t))
    return "lodzie-i-pontony";

  // ── Pudełka ─────────────────────────────────────────────────────────────────
  if (
    /pudelko|pudelka|magbox|pojemnik|skrzynia transportowa|\bwiadro\b|\bbucket\b|bait box|tackle box|tackle chest|organizer|bakkan|tray|space cube/.test(
      t
    )
  )
    return "pojemniki-i-organizacja";

  // ── Narzędzia ───────────────────────────────────────────────────────────────
  if (
    /\bsiatka\b|siatka na ryby|\bkeepnet\b|\bszczypce\b|szczypce (wedkarsk|do haczyko)|noz (wedkarski|fishing|do filetowania)|nozyce wedkarsk|miarka ryb|\bwaga\b|waga wedkarska|\bigl[ay]\b.*(przynet|kulek|edges|needle)|\bneedle\b|\bwiertlo\b|zaciskarka|krimp tool|rozplatacz|klucz wedkarski|rura zanetowa|throwing stick|kobra zanetowa|nawijarka do zyl|line winder|line spooler/.test(
      t
    )
  )
    return "narzedzia-drobne";

  // ── Transport ───────────────────────────────────────────────────────────────
  if (/torba na przynety/.test(t)) return "torby-wedkarskie";

  // ── Akcesoria karpiowe (reszta) ────────────────────────────────────────────
  if (
    /\bstojak\b|stojak wedkarski|stojak wędkarski|kolys[zk][ai]? karpiow|kolys[zk][ai]? do ryb|miernik ryb|waga karpow|\bmarker\b|marker float|cone marker|marker na zylke|stojak (trojnog|do wazenia)|przeciagacz do rurek|\buchwyt\b|\bramie\b|\barm\b|rod belt|opaska na wedki|prysznic (kampowy|turystyczny)|kanister na wode|kuchenka (kampowa|skladana)|patelnia|kranik na wode|sztucc|otwieracz|owadobojcza/.test(
      t
    )
  )
    return "drobne-akcesoria-karpiowe";

  // ── Zestawy ─────────────────────────────────────────────────────────────────
  if (/zestaw (wedkarski|startowy|kompletny|do wedkowania|spławikow)|komplet wedkarski|pakiet wedkarski/.test(t))
    return "zestawy-wedkarskie";

  return "pozostale-akcesoria-wedkarskie";
}

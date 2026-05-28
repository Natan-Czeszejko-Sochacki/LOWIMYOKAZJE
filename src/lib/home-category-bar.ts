import { getRootCategories } from "./categories";

export type HomeCategorySubLink = {
  label: string;
  href: string;
};

export type HomeCategoryMenuItem = {
  label: string;
  href: string;
  children?: HomeCategorySubLink[];
};

function cat(slug: string): string {
  return `/kategoria/${slug}`;
}

/** Menu kategorii na stronie głównej — pozycje i podkategorie po najechaniu */
export const homeCategoryMenu: HomeCategoryMenuItem[] = [
  {
    label: "Wszystkie kategorie",
    href: "/kategorie",
    children: getRootCategories().map((c) => ({
      label: c.name,
      href: cat(c.slug),
    })),
  },
  {
    label: "Feeder",
    href: cat("sprzet-feeder-i-method"),
    children: [
      { label: "Wędki feederowe", href: cat("wedki-feederowe") },
      { label: "Kołowrotki feederowe", href: cat("kolowrotki-feederowe") },
      { label: "Koszyki zanętowe", href: cat("koszyki-zanetowe") },
      { label: "Zanęty method", href: cat("zanety-method") },
      { label: "Akcesoria feeder", href: cat("akcesoria-feeder-method") },
      { label: "Cały feeder →", href: cat("sprzet-feeder-i-method") },
    ],
  },
  {
    label: "Spinning",
    href: cat("wedki-spinningowe"),
    children: [
      { label: "Wędki spinningowe", href: cat("wedki-spinningowe") },
      { label: "Kołowrotki spinningowe", href: cat("kolowrotki-spinningowe") },
      { label: "Woblery", href: cat("woblery") },
      { label: "Gumy", href: cat("gumy-wedkarskie") },
      { label: "Błystki", href: cat("blystki") },
      { label: "Główki jigowe", href: cat("glowki-jigowe") },
      { label: "Plecionki", href: cat("zylki-plecionki") },
    ],
  },
  {
    label: "Karp",
    href: cat("akcesoria-karpiowe"),
    children: [
      { label: "Wędki karpiowe", href: cat("wedki-karpiowe") },
      { label: "Kołowrotki karpiowe", href: cat("kolowrotki-karpiowe") },
      { label: "Kulki proteinowe", href: cat("kulki-proteinowe") },
      { label: "Karmniki i zanęty", href: cat("karmniki-i-zanety-karpiowe") },
      { label: "Sygnalizatory brań", href: cat("sygnalizatory-brania") },
      { label: "Podpórki", href: cat("podporki-wedki") },
      { label: "Akcesoria karpiowe", href: cat("akcesoria-karpiowe") },
    ],
  },
  {
    label: "Odzież",
    href: cat("odziez-wedkarska"),
    children: [
      { label: "Kurtki i spodnie", href: cat("odziez-kurtki-spodnie") },
      { label: "Buty", href: cat("obuwie-wedkarskie") },
      { label: "Czapki i rękawice", href: cat("odziez-czapki-rekawice") },
      { label: "Okulary", href: cat("odziez-okulary") },
    ],
  },
  {
    label: "Siedziska i osprzęt",
    href: cat("krzesla-wedkarskie"),
    children: [
      { label: "Krzesła wędkarskie", href: cat("krzesla-wedkarskie") },
      { label: "Podpórki", href: cat("podporki-wedki") },
      { label: "Namioty i sheltery", href: cat("namioty-i-sheltery") },
      { label: "Parasole", href: cat("namioty-parasole") },
      { label: "Śpiwory i maty", href: cat("namioty-spiwory-maty") },
      { label: "Stoliki biwakowe", href: cat("stoliki-biwakowe") },
    ],
  },
  {
    label: "Bagaż",
    href: cat("transport-i-torby"),
    children: [
      { label: "Torby", href: cat("torby-wedkarskie") },
      { label: "Pokrowce", href: cat("pokrowce-wedkarskie") },
      { label: "Plecaki", href: cat("torby-plecaki") },
      { label: "Pudełka i organizacja", href: cat("pojemniki-i-organizacja") },
    ],
  },
  {
    label: "Akcesoria",
    href: cat("akcesoria-wedkarskie"),
    children: [
      { label: "Krętliki i agrafki", href: cat("kretliki-i-agrafki") },
      { label: "Stopery i klipsy", href: cat("stopery-i-klipsy") },
      { label: "Szpule i części", href: cat("szpule-i-czesci") },
      { label: "Haczyki", href: cat("haczyki") },
      { label: "Ciężarki", href: cat("ciezarki") },
      { label: "Pozostałe", href: cat("pozostale-akcesoria-wedkarskie") },
    ],
  },
];

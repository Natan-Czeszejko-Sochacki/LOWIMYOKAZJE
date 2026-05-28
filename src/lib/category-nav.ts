/** Układ nawigacji kategorii — zgodny z menu głównym */
export type CategoryNavLink = {
  label: string;
  slug: string;
};

export type CategoryNavGroup = {
  label: string;
  slug: string;
  children?: CategoryNavLink[];
};

export const categoryNavGroups: CategoryNavGroup[] = [
  {
    label: "Kołowrotki",
    slug: "kolowrotki",
    children: [
      { label: "Spinningowe", slug: "kolowrotki-spinningowe" },
      { label: "Karpiowe", slug: "kolowrotki-karpiowe" },
      { label: "Feederowe", slug: "kolowrotki-feederowe" },
    ],
  },
  {
    label: "Wędki",
    slug: "wedki",
    children: [
      { label: "Spinningowe", slug: "wedki-spinningowe" },
      { label: "Karpiowe", slug: "wedki-karpiowe" },
      { label: "Feederowe", slug: "wedki-feederowe" },
      { label: "Spławikowe", slug: "wedki-spławikowe" },
    ],
  },
  {
    label: "Przynęty",
    slug: "przynety",
    children: [
      { label: "Woblery", slug: "woblery" },
      { label: "Gumy", slug: "gumy-wedkarskie" },
      { label: "Błystki", slug: "blystki" },
      { label: "Główki jigowe", slug: "glowki-jigowe" },
      { label: "Naturalne", slug: "przynety-naturalne" },
      { label: "Inne sztuczne", slug: "inne-przynety-sztuczne" },
    ],
  },
  {
    label: "Zanęty",
    slug: "zanety-i-kulki",
    children: [
      { label: "Sypkie", slug: "zanety-sypkie" },
      { label: "Pellety", slug: "zanety-pellety" },
      { label: "Dipy", slug: "odzywki-i-dipy" },
      { label: "Method", slug: "zanety-method" },
      { label: "Dodatki", slug: "zanety-dodatki" },
      { label: "Karmniki", slug: "karmniki-i-zanety-karpiowe" },
    ],
  },
  {
    label: "Żyłki",
    slug: "zylki-i-plecionki",
    children: [
      { label: "Plecionki", slug: "zylki-plecionki" },
      { label: "Fluorocarbon", slug: "zylki-fluorocarbon" },
      { label: "Monofilament", slug: "zylki-monofilament" },
      { label: "Przypony", slug: "przypony" },
    ],
  },
  {
    label: "Elektronika",
    slug: "elektronika-wedkarska",
    children: [
      { label: "Echosondy i GPS", slug: "echosondy-i-gps" },
      { label: "Sygnalizatory", slug: "sygnalizatory-brania" },
      { label: "Latarki", slug: "latarki-wedkarskie" },
    ],
  },
  {
    label: "Namioty",
    slug: "namioty-wedkarskie",
    children: [
      { label: "Namioty i sheltery", slug: "namioty-i-sheltery" },
      { label: "Parasole", slug: "namioty-parasole" },
      { label: "Śpiwory i maty", slug: "namioty-spiwory-maty" },
      { label: "Stoliki", slug: "stoliki-biwakowe" },
    ],
  },
  {
    label: "Odzież",
    slug: "odziez-wedkarska",
    children: [
      { label: "Kurtki i spodnie", slug: "odziez-kurtki-spodnie" },
      { label: "Buty", slug: "obuwie-wedkarskie" },
      { label: "Czapki i rękawice", slug: "odziez-czapki-rekawice" },
      { label: "Okulary", slug: "odziez-okulary" },
    ],
  },
  {
    label: "Torby",
    slug: "transport-i-torby",
    children: [
      { label: "Torby", slug: "torby-wedkarskie" },
      { label: "Pokrowce", slug: "pokrowce-wedkarskie" },
      { label: "Plecaki", slug: "torby-plecaki" },
    ],
  },
  {
    label: "Akcesoria",
    slug: "akcesoria-wedkarskie",
    children: [
      { label: "Krętliki i agrafki", slug: "kretliki-i-agrafki" },
      { label: "Stopery i klipsy", slug: "stopery-i-klipsy" },
      { label: "Szpule i części", slug: "szpule-i-czesci" },
      { label: "Pozostałe", slug: "pozostale-akcesoria-wedkarskie" },
    ],
  },
  {
    label: "Spławiki",
    slug: "splawiki",
    children: [
      { label: "Pojedyncze", slug: "splawiki-pojedyncze" },
      { label: "Zestawy", slug: "zestawy-spławikowe" },
    ],
  },
];

export const categoryNavStandalone: CategoryNavLink[] = [
  { label: "Kulki proteinowe", slug: "kulki-proteinowe" },
  { label: "Haczyki", slug: "haczyki" },
  { label: "Podbieraki", slug: "podbieraki" },
  { label: "Krzesła", slug: "krzesla-wedkarskie" },
  { label: "Koszyki", slug: "koszyki-zanetowe" },
  { label: "Ciężarki", slug: "ciezarki" },
  { label: "Podpórki", slug: "podporki-wedki" },
  { label: "Pudełka", slug: "pojemniki-i-organizacja" },
  { label: "Sumowe", slug: "sprzet-sumowy" },
];

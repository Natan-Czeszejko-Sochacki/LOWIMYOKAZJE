export function isSearchUrl(url: string): boolean {
  return (
    /[?&](s|search|szukaj|query|searchword|fraza)=/i.test(url) ||
    /\/szukaj/i.test(url)
  );
}

export function offerLinkLabel(url: string): string {
  if (url.includes("ceneo.pl/Click")) return "Do sklepu →";
  if (isSearchUrl(url)) return "Szukaj w sklepie →";
  return "Do produktu →";
}

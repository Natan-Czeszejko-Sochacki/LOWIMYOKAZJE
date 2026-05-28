import * as cheerio from "cheerio";

export type ParsedProduct = {
  name: string;
  price: number | null;
  originalPrice: number | null;
  /** Najniższa cena z ostatnich 30 dni (Omnibus) — podana przez sklep */
  lowestPrice30d: number | null;
  imageUrl: string | null;
  ean: string | null;
  producerCode: string | null;
  brand: string | null;
  inStock: boolean;
};

export function parsePolishPrice(text: string): number | null {
  if (!text) return null;
  const cleaned = text.replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  const m = cleaned.match(/(\d+[,.]?\d*)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function parseProductPageHtml(html: string, pageUrl: string): ParsedProduct {
  const $ = cheerio.load(html);
  const structuredProduct = getStructuredProduct($);

  const name =
    cleanText(getString(structuredProduct?.name)) ||
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $("title").text().split("|")[0].trim();

  let price: number | null = null;
  const priceContent =
    $('[itemprop="price"]').attr("content") ||
    getOfferField(structuredProduct?.offers, "price") ||
    "";
  if (priceContent) price = parsePolishPrice(priceContent);

  const wooPrices = parseWooCommercePrices($);
  if (price === null && wooPrices.price !== null) price = wooPrices.price;

  if (price === null) {
    price =
      parsePolishPrice($(".projector_price_value").first().text()) ||
      parsePolishPrice($('[data-price]').attr("data-price") || "") ||
      parsePolishPrice($(".product-price").first().text()) ||
      parseVisiblePrice($(".price").first());
  }

  let originalPrice: number | null = wooPrices.originalPrice;

  // ─────────────────────────────────────────────────────────────────────────
  // Strategia 1 (sibling-based): szukaj <del> jako bezpośredniego dziecka
  // RODZICA lub DZIADKA elementu [itemprop="price"].
  //
  // Dlaczego tak? Wiele sklepów ma banery/widgety ze skrzyżowanymi cenami
  // gdzieś na stronie (np. "darmowa dostawa od 22,70 zł"). Stara strategia
  // (.closest(".price").find("del")) przechodziła przez cały subtree dużego
  // kontenera i łapała takie elementy.
  //
  // Maksimum 2 poziomy w górę gwarantuje, że <del> jest OBOK ceny bieżącej,
  // a nie gdzieś głęboko w innej sekcji strony.
  //
  // WooCommerce: span[itemprop="price"] ← ins ← p.price → del (2 poziomy)
  // IAI/standard: span[itemprop="price"] ← .price → .price-old sibling (1 poziom)
  // ─────────────────────────────────────────────────────────────────────────
  const priceEl = $('[itemprop="price"]').first();
  if (priceEl.length) {
    const parent = priceEl.parent();
    const grandparent = parent.parent();

    // Preferuj dziadka (WooCommerce: del jest sibling of ins)
    const fromGrandparent = grandparent.children("del, s").first().text();
    const fromParent = parent.children("del, s").first().text();

    const delText = fromGrandparent || fromParent;
    if (delText) originalPrice = parsePolishPrice(delText);
  }

  // Strategia 2: JSON-LD — highPrice > lowPrice = cena regularna/promocja
  if (!originalPrice) {
    const hp = getOfferField(structuredProduct?.offers, "highPrice");
    const lp = getOfferField(structuredProduct?.offers, "lowPrice");
    if (hp && lp) {
      const highVal = parsePolishPrice(hp);
      const lowVal = parsePolishPrice(lp);
      if (highVal && lowVal && highVal > lowVal) originalPrice = highVal;
    }
  }

  // Strategia 3: IAI/IdoSell — .price-old jako dedykowana klasa ceny przed
  // Uwaga: NIE używamy .projector_price_yousave (może być widget oszczędności)
  if (!originalPrice) {
    originalPrice = parsePolishPrice(
      $(".projector_price .price-old").first().text()
    );
  }

  // Strategia 4: PrestaShop — dedykowany kontener przeceny
  if (!originalPrice) {
    originalPrice = parsePolishPrice(
      $(".product-discount .regular-price").first().text()
    );
  }

  // ─── Walidacje ────────────────────────────────────────────────────────────
  // Musi być wyraźnie wyższa niż cena aktualna (min 5%)
  if (originalPrice && price && originalPrice <= price * 1.05) originalPrice = null;

  // Sanity cap: max 4× ceny aktualnej (>75% zniżki = błąd parsowania)
  if (originalPrice && price && originalPrice > price * 4) originalPrice = null;

  let imageUrl =
    $('meta[property="og:image"]').attr("content") ||
    $("img[itemprop='image']").attr("src") ||
    $(".product-image img, .gallery img, #bigimg img").first().attr("src") ||
    null;

  if (imageUrl?.startsWith("//")) imageUrl = `https:${imageUrl}`;
  if (imageUrl?.startsWith("/")) {
    const base = new URL(pageUrl);
    imageUrl = `${base.origin}${imageUrl}`;
  }

  const bodyText = $("body").text();
  const ean =
    normalizeDigits(
      $("meta[itemprop='gtin13']").attr("content") ||
        $('[itemprop="gtin13"]').text() ||
        $('[itemprop="gtin"]').text() ||
        getString(structuredProduct?.gtin13) ||
        getString(structuredProduct?.gtin) ||
        getString(structuredProduct?.gtin8) ||
        getString(structuredProduct?.gtin12) ||
        getString(structuredProduct?.gtin14) ||
        findLabelValue(bodyText, /(?:EAN|GTIN|kod kreskowy)/i, /\d{8,14}/)
    ) ?? null;
  const producerCode =
    cleanText(
      $('[itemprop="sku"]').attr("content") ||
        $('[itemprop="sku"]').text() ||
        $('[itemprop="mpn"]').attr("content") ||
        $('[itemprop="mpn"]').text() ||
        getString(structuredProduct?.sku) ||
        getString(structuredProduct?.mpn) ||
        findLabelValue(
          bodyText,
          /(?:kod producenta|symbol producenta|nr katalogowy|numer katalogowy|indeks|SKU|MPN)/i,
          /[A-Z0-9][A-Z0-9._/-]{2,}/i
        )
    ) ?? null;

  const rawBrand =
    getBrandName(structuredProduct?.brand) ||
    cleanText($('[itemprop="brand"]').attr("content") || $('[itemprop="brand"]').text()) ||
    cleanText($(".product-brand, .brand, [class*='brand-name'], [class*='manufacturer']").first().text()) ||
    cleanText(
      (() => {
        let found: string | null = null;
        $(".woocommerce-product-attributes tr, .shop_attributes tr").each((_, row) => {
          const label = $(row).find("th, td:first-child").text();
          if (/marka|producent|brand|manufacturer/i.test(label)) {
            found = $(row).find("td, td:last-child").last().text().trim() || null;
            return false;
          }
        });
        return found;
      })()
    ) ||
    findLabelValue(bodyText, /(?:^|\s)(?:marka|producent|brand|manufacturer)\s*[:\-]/im, /[A-ZŁŚŹŻĆĄĘÓ][A-Za-z0-9ŁłŚśŹźŻżĆćĄąĘęÓó\s&+/-]{1,40}/) ||
    null;
  const brand = isPlausibleBrand(rawBrand) ? rawBrand : null;

  // Cena z ostatnich 30 dni (dyrektywa Omnibus) — wiele polskich sklepów podaje ją obowiązkowo
  const OMNIBUS_SELECTOR = [
    "[class*='omnibus']",
    "[class*='lowest-price']",
    "[class*='lowest_price']",
    ".woocommerce-omnibus",
    ".ee_lowest_price",
    ".yith-wccp-omnibus",
    "[class*='price-history']",
    "[class*='pricehistory']",
  ].join(", ");
  let lowestPrice30d: number | null = null;
  const omnibusEl = $(OMNIBUS_SELECTOR).first().text();
  if (omnibusEl) {
    lowestPrice30d = parsePolishPrice(omnibusEl);
  }
  if (!lowestPrice30d) {
    lowestPrice30d =
      findLabelValue(
        bodyText,
        /najni[żz]sz[ae]\s+cen[ae]\s*(?:z|w)\s*(?:ostatni[ąchx]*\s*)?30\s*dni/i,
        /[\d\s]+[,.][\d]+/
      )?.replace(/\s/g, "").replace(",", ".") != null
        ? parsePolishPrice(
            findLabelValue(
              bodyText,
              /najni[żz]sz[ae]\s+cen[ae]\s*(?:z|w)\s*(?:ostatni[ąchx]*\s*)?30\s*dni/i,
              /[\d\s]+[,.]\d+/
            ) ?? ""
          )
        : null;
  }
  // Omnibus musi być rozsądny: nie wyższy niż 1.5× cena aktualna
  if (lowestPrice30d && price && lowestPrice30d >= price * 1.5) lowestPrice30d = null;

  // Kluczowa zasada Omnibus: jeśli najniższa cena z 30 dni ≈ cena aktualna → produkt NIE jest na przecenie
  // Odrzucamy wtedy originalPrice bo był błędnie sparsowany
  if (lowestPrice30d && price && lowestPrice30d <= price * 1.05) {
    originalPrice = null;
  }

  const schemaAvailability = getOfferField(
    structuredProduct?.offers,
    "availability"
  );
  const avail =
    schemaAvailability ||
    $('[itemprop="availability"]').attr("href") ||
    $('[itemprop="availability"]').text() ||
    $(".availability, .product-availability, .stock, .availability_value")
      .first()
      .text();
  // Tylko główny blok zakupu — unikamy „Do koszyka” z sekcji podobnych produktów (np. Moonfin/IAI)
  const mainBuyBox = $(
    ".projector_buttons, .product-actions, #add-to-cart-or-refresh, .product-add-to-cart"
  ).first();
  const cartControls = (
    mainBuyBox.length
      ? mainBuyBox
      : $(
          'button[name="add"], button.add-to-cart, .add-to-cart, form[action*="cart"] button'
        ).first().closest("form, .product-actions, .summary")
  ).text();
  const explicitOutOfStock =
    /outofstock|out.of.stock|soldout|niedostępn|brak na stanie|brak w magazynie|chwilowo brak|powiadom/i.test(
      avail
    );
  const explicitInStock = /instock|in.stock|dostępn|do koszyka|kup teraz|dodaj do koszyka/i.test(
    `${avail} ${cartControls}`
  );
  // Status głównego produktu (avail) ma pierwszeństwo przed przyciskami z innych sekcji strony
  const inStock = explicitOutOfStock
    ? false
    : explicitInStock || !explicitOutOfStock;

  return { name, price, originalPrice, lowestPrice30d, imageUrl, ean, producerCode, brand, inStock };
}

/** WooCommerce: cena promocyjna w <ins>, przekreślona w <del> (np. e-amur.pl). */
function parseWooCommercePrices($: cheerio.CheerioAPI): {
  price: number | null;
  originalPrice: number | null;
} {
  const container = $(
    ".single-product .summary .price, .entry-summary .price, .product .summary .price"
  ).first();
  if (!container.length) return { price: null, originalPrice: null };

  const insPrice = parsePolishPrice(
    container.find("ins .amount, ins .woocommerce-Price-amount").first().text()
  );
  const delPrice = parsePolishPrice(
    container.find("del .amount, del .woocommerce-Price-amount").first().text()
  );

  if (insPrice) {
    return {
      price: insPrice,
      originalPrice: delPrice && delPrice > insPrice ? delPrice : null,
    };
  }

  return {
    price: parsePolishPrice(
      container.find(".amount, .woocommerce-Price-amount").first().text()
    ),
    originalPrice: null,
  };
}

/** Parsuje widoczną cenę bez łączenia del+ins w jedną liczbę (55.00zł46.75zł → 55.0046). */
function parseVisiblePrice(el: cheerio.Cheerio<import("domhandler").AnyNode>): number | null {
  if (!el.length) return null;
  if (el.find("ins").length) {
    return parsePolishPrice(el.find("ins .amount, ins .woocommerce-Price-amount").first().text());
  }
  return parsePolishPrice(el.text());
}

function getStructuredProduct($: cheerio.CheerioAPI): Record<string, unknown> | null {
  let product: Record<string, unknown> | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    if (product) return;
    try {
      const parsed = JSON.parse($(el).text()) as unknown;
      product = findProductNode(parsed);
    } catch {
      /* ignore invalid structured data */
    }
  });
  return product;
}

function findProductNode(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const product = findProductNode(item);
      if (product) return product;
    }
    return null;
  }
  if (!value || typeof value !== "object") return null;

  const node = value as Record<string, unknown>;
  const type = node["@type"];
  if (
    type === "Product" ||
    (Array.isArray(type) && type.some((t) => String(t).toLowerCase() === "product"))
  ) {
    return node;
  }
  return findProductNode(node["@graph"]);
}

function getString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return null;
}

function getOfferField(offers: unknown, key: string): string | null {
  const offer = Array.isArray(offers) ? offers[0] : offers;
  if (offer && typeof offer === "object" && key in offer) {
    return getString((offer as Record<string, unknown>)[key]);
  }
  return null;
}

function getBrandName(value: unknown): string | null {
  if (typeof value === "string") return cleanText(value);
  if (value && typeof value === "object" && "name" in value) {
    return cleanText(String((value as { name?: unknown }).name ?? ""));
  }
  return null;
}

function cleanText(value?: string | null): string | null {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned || null;
}

/** Odrzuca adresy firm, NIP-y i inne śmieci parsowane jako marka. */
function isPlausibleBrand(value?: string | null): boolean {
  if (!value) return false;
  if (value.length > 40) return false;
  if (/ul\.|nip|sp\.\s*z\s*o\.?\s*o|s\.a\.|@\w|www\.|http/i.test(value)) return false;
  if (/\d{3}[-\s]?\d{2}[-\s]?\d{2}/.test(value)) return false;
  if (/sprzedaz|sklep|hurtownia|magazyn|polska\s+\d/i.test(value)) return false;
  return true;
}

function normalizeDigits(value?: string | null): string | null {
  const digits = value?.replace(/\D/g, "");
  return digits && /^\d{8,14}$/.test(digits) ? digits : null;
}

function findLabelValue(
  text: string,
  label: RegExp,
  valuePattern: RegExp
): string | null {
  const normalized = text.replace(/\s+/g, " ");
  const labelMatch = normalized.match(label);
  if (labelMatch?.index === undefined) return null;
  return normalized.slice(labelMatch.index, labelMatch.index + 120).match(valuePattern)?.[0] ?? null;
}

export async function fetchAndParseProduct(url: string): Promise<ParsedProduct | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "pl-PL,pl;q=0.9",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    return parseProductPageHtml(await res.text(), url);
  } catch {
    return null;
  }
}

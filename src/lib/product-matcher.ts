import { createHash } from "crypto";

/** Normalizuje nazwę produktu (bez marki) do porównań. */
export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeProductKey(name: string, brand?: string | null): string {
  const raw = `${brand ?? ""} ${name}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return raw;
}

export function normalizeEan(ean?: string | null): string | null {
  const digits = ean?.replace(/\D/g, "");
  return digits && /^\d{8,14}$/.test(digits) ? digits : null;
}

const INVALID_PRODUCER_CODES = new Set([
  "sku",
  "mpn",
  "ean",
  "gtin",
  "id",
  "code",
  "nr",
  "ref",
  "art",
  "artnr",
  "indeks",
  "symbol",
  "katalogowy",
  "numer",
  "producent",
  "producenta",
  "skuteczno",
  "producentow",
]);

const GENERIC_NAME_PREFIXES = new Set([
  "guma",
  "wedka",
  "kolowrotek",
  "zylka",
  "przypon",
  "wiertlo",
  "haczyk",
  "przyneta",
  "wobler",
  "spinning",
  "tackle",
  "akcesoria",
  "torba",
  "plecak",
  "bluza",
  "czapka",
  "namiot",
  "mata",
  "stojak",
]);

export function normalizeProducerCode(code?: string | null): string | null {
  const normalized = code
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
  if (!normalized || normalized.length < 3) return null;

  const deduped = collapseRepeatedCode(normalized);
  if (INVALID_PRODUCER_CODES.has(deduped)) return null;
  return deduped;
}

function collapseRepeatedCode(code: string): string {
  if (code.length % 2 !== 0) return code;

  const midpoint = code.length / 2;
  const firstHalf = code.slice(0, midpoint);
  const secondHalf = code.slice(midpoint);
  if (firstHalf.length >= 3 && firstHalf === secondHalf) {
    return firstHalf;
  }

  return code;
}

/** Wyciąga markę z nazwy (np. „Guma Illex …” → illex, „Savage Gear …” → savagegear). */
export function inferBrandFromName(name: string): string | null {
  const words = normalizeProductName(name).split(" ").filter(Boolean);
  if (words.length === 0) return null;

  let start = 0;
  while (start < words.length - 1 && GENERIC_NAME_PREFIXES.has(words[start])) {
    start++;
  }

  if (start >= words.length) return words[0] ?? null;

  const w0 = words[start];
  const w1 = words[start + 1];
  if (w1 && w1.length <= 5 && !GENERIC_NAME_PREFIXES.has(w1)) {
    return `${w0}${w1}`;
  }
  return w0;
}

/** Normalizuje markę; odrzuca adresy firm dystrybutorów z feedów sklepów. */
export function normalizeBrand(
  brand?: string | null,
  productName?: string
): string | null {
  if (!brand && productName) return inferBrandFromName(productName);
  if (!brand) return null;

  const looksLikeCompanyBlock =
    brand.length > 40 ||
    /\d{2,}/.test(brand) ||
    /@/.test(brand) ||
    /\b(nip|ul\.|sp\.\s*z\s*o\.?\s*o\.?|s\.?\s*r\.?\s*o\.?)\b/i.test(brand);
  if (looksLikeCompanyBlock) {
    return productName ? inferBrandFromName(productName) : null;
  }

  const cleaned = brand
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return productName ? inferBrandFromName(productName) : null;

  const words = cleaned.split(" ").filter(Boolean);
  if (words.length >= 2 && words[1].length <= 5) {
    return `${words[0]}${words[1]}`;
  }
  return words[0] ?? null;
}

/** Nazwa producenta do wyświetlenia — tylko firma, bez NIP, adresu i danych prawnych */
export function formatManufacturerDisplay(
  brand?: string | null,
  productName?: string
): string | null {
  if (brand?.trim()) {
    if (looksLikeCompanyBrandBlock(brand)) {
      const inferred = inferBrandDisplayFromName(productName ?? "");
      if (inferred) return inferred;
    }

    const cleaned = brand
      .trim()
      .replace(/\s*\|.*$/, "")
      .replace(/\s*\/.*$/, "")
      .replace(/\b(sp\.?\s*z\s*o\.?\s*o\.?|s\.?\s*a\.?|s\.?\s*r\.?\s*o\.?|sp\.?\s*j\.?).*$/gi, "")
      .replace(/\b(ul\.|al\.|os\.|nip\s*:?\s*\d[\d\s-]*|tel\.|fax\.|e-?mail|www\.|https?:\/\/|@).*$/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (
      cleaned.length > 0 &&
      cleaned.length <= 48 &&
      !/\d{5,}/.test(cleaned) &&
      !/@/.test(cleaned)
    ) {
      return cleaned;
    }
  }

  const inferred = inferBrandDisplayFromName(productName ?? "");
  return inferred || null;
}

function looksLikeCompanyBrandBlock(value: string): boolean {
  return (
    value.length > 40 ||
    /\d{2,}/.test(value) ||
    /@/.test(value) ||
    /\b(nip|ul\.|sp\.\s*z\s*o\.?\s*o\.?|s\.?\s*a\.?|s\.?\s*r\.?\s*o\.?|adres|polska|email|e-?mail|www\.)\b/i.test(
      value
    )
  );
}

function inferBrandDisplayFromName(name: string): string | null {
  const rawWords = name.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return null;

  let start = 0;
  while (
    start < rawWords.length - 1 &&
    GENERIC_NAME_PREFIXES.has(
      rawWords[start]
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "")
    )
  ) {
    start++;
  }

  if (start >= rawWords.length) return null;

  const w0 = rawWords[start];
  const w1 = rawWords[start + 1];
  const w1Key = w1
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
  if (w1 && w1.length <= 5 && w1Key && !GENERIC_NAME_PREFIXES.has(w1Key)) {
    return `${w0} ${w1}`;
  }
  return w0;
}

export function brandKey(name: string, brand?: string | null): string | null {
  return normalizeBrand(brand, name);
}

/** Podobieństwo nazw (Jaccard na słowach ≥3 znaki). */
export function productNameSimilarity(a: string, b: string): number {
  const words = (s: string) =>
    new Set(
      normalizeProductName(s)
        .split(" ")
        .filter((w) => w.length >= 3)
    );
  const wa = words(a);
  const wb = words(b);
  if (wa.size === 0 || wb.size === 0) return 0;
  let inter = 0;
  for (const w of wa) {
    if (wb.has(w)) inter++;
  }
  const union = new Set([...wa, ...wb]).size;
  return inter / union;
}

const NAME_MATCH_THRESHOLD = 0.25;

function significantWords(name: string, brand?: string | null): string[] {
  const bk = brandKey(name, brand);
  return normalizeProductName(name)
    .split(" ")
    .filter((w) => w.length >= 3 && w !== bk);
}

function namesCompatible(a: string, b: string, brandA?: string | null, brandB?: string | null): boolean {
  const wa = significantWords(a, brandA);
  const wb = significantWords(b, brandB);
  const shared = wa.filter((w) => wb.includes(w)).length;
  if (shared >= 2) return true;
  return productNameSimilarity(a, b) >= NAME_MATCH_THRESHOLD;
}

function codeLookupKey(brand: string, code: string): string {
  return `${brand}:${code}`;
}

function codeGroupId(brand: string | null, code: string): string {
  return brand ? `code:${brand}:${code}` : `code:${code}`;
}

function hashGroupId(name: string): string {
  const key = normalizeProductName(name);
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

/**
 * Kanoniczny identyfikator grupy produktu.
 * Priorytet: marka+kod producenta > EAN > hash nazwy.
 */
export function computeGroupId(
  name: string,
  brand?: string | null,
  ean?: string | null,
  producerCode?: string | null
): string {
  const normalizedProducerCode = normalizeProducerCode(producerCode);
  if (normalizedProducerCode) {
    const bk = brandKey(name, brand);
    return codeGroupId(bk, normalizedProducerCode);
  }
  const normalizedEan = normalizeEan(ean);
  if (normalizedEan) {
    return `ean:${normalizedEan}`;
  }
  return hashGroupId(name);
}

export type ProductIdentity = {
  name: string;
  brand?: string | null;
  ean?: string | null;
  producerCode?: string | null;
};

type CodeEntry = { groupId: string; name: string };

/** Mapa identyfikatorów → kanoniczny group_id (używana przy sync). */
export class ProductIdentityIndex {
  private codeToEntry = new Map<string, CodeEntry>();
  private eanToGroup = new Map<string, string>();
  private nameToGroup = new Map<string, string>();

  static fromListings(
    rows: {
      group_id: string;
      name: string;
      brand: string | null;
      ean: string | null;
      producer_code: string | null;
    }[]
  ): ProductIdentityIndex {
    const index = new ProductIdentityIndex();
    for (const row of rows) {
      index.register(row.group_id, {
        name: row.name,
        brand: row.brand,
        ean: row.ean,
        producerCode: row.producer_code,
      });
    }
    return index;
  }

  register(groupId: string, identity: ProductIdentity) {
    const code = normalizeProducerCode(identity.producerCode);
    const ean = normalizeEan(identity.ean);
    const nameKey = normalizeProductName(identity.name);
    const bk = brandKey(identity.name, identity.brand);

    if (code && bk) {
      const key = codeLookupKey(bk, code);
      const existing = this.codeToEntry.get(key);
      if (!existing || namesCompatible(existing.name, identity.name, undefined, identity.brand)) {
        this.codeToEntry.set(key, { groupId, name: identity.name });
      }
    }
    if (ean) this.eanToGroup.set(ean, groupId);
    if (!code && !ean && nameKey) this.nameToGroup.set(nameKey, groupId);
  }

  resolve(identity: ProductIdentity): string {
    const code = normalizeProducerCode(identity.producerCode);
    const ean = normalizeEan(identity.ean);
    const nameKey = normalizeProductName(identity.name);
    const bk = brandKey(identity.name, identity.brand);

    let groupId: string;

    if (code && bk) {
      const key = codeLookupKey(bk, code);
      const existing = this.codeToEntry.get(key);
      if (existing && namesCompatible(existing.name, identity.name, undefined, identity.brand)) {
        groupId = existing.groupId;
      } else if (existing && !namesCompatible(existing.name, identity.name, undefined, identity.brand)) {
        // Ten sam kod u tej samej marki, ale inny produkt — nie łącz
        groupId = hashGroupId(identity.name);
      } else {
        groupId = codeGroupId(bk, code);
      }
    } else if (code) {
      groupId = codeGroupId(null, code);
    } else if (ean) {
      groupId = this.eanToGroup.get(ean) ?? `ean:${ean}`;
    } else if (nameKey && this.nameToGroup.has(nameKey)) {
      groupId = this.nameToGroup.get(nameKey)!;
    } else {
      groupId = computeGroupId(
        identity.name,
        identity.brand,
        identity.ean,
        identity.producerCode
      );
    }

    this.register(groupId, identity);
    return groupId;
  }
}

/** Wybiera najlepszy group_id przy konflikcie (code: > ean: > hash). */
export function pickCanonicalGroupId(ids: string[]): string {
  const sorted = [...ids].sort((a, b) => groupIdPriority(a) - groupIdPriority(b));
  return sorted[0];
}

function groupIdPriority(id: string): number {
  if (id.startsWith("code:")) return 0;
  if (id.startsWith("ean:")) return 1;
  return 2;
}

export function externalIdFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] || path;
  } catch {
    return url;
  }
}

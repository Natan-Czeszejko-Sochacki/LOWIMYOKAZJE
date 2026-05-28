export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  parentId?: string;
};

export type Store = {
  id: string;
  name: string;
  url: string;
  description: string;
  founded?: number;
  trustScore: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categoryId: string;
  /** URL zdjęcia produktu (aktualizowane przez sync z Ceneo) */
  image: string;
  /** Krótsze zapytanie do wyszukiwarek sklepów */
  searchQuery: string;
  ean?: string;
  description: string;
};

export type StoreOffer = {
  storeId: string;
  productId: string;
  price: number;
  /** Przekreślona cena ze strony produktu (pewna informacja o przecenie) */
  originalPrice?: number;
  /** Najniższa cena z ostatnich 30 dni (dyrektywa Omnibus) — podawana przez sklep */
  lowestPrice30d?: number;
  /** Cena sprzed ostatniej odnotowanej zmiany — tylko do odznaki CENA SPADŁA */
  previousPrice?: number;
  currency: "PLN";
  url: string;
  inStock: boolean;
  updatedAt: string;
};

export type ProductWithOffers = Product & {
  offers: StoreOffer[];
  bestOffer: StoreOffer | null;
  discountPercent: number;
};

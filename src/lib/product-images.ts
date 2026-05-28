/** Zdjęcia producentów / Ceneo — dopóki sync nie nadpisze z Ceneo */
export const defaultProductImages: Record<string, string> = {
  "shimano-stradic-4000":
    "https://image.ceneostatic.pl/data/products/169159376/i-shimano-kolowrotek-wedkarski-stradic-fm-4000-st4000fm.jpg",
  "daiwa-bg-mq-5000":
    "https://dassets2.daiwa.com/globalassets/products/reels/bg-mq/bg_mq_5000_ha_main.jpg",
  "rapala-x-rap":
    "https://www.rapala.com/globalassets/products/lures/x-rap/xrap_10_silver_1.jpg",
  "savage-gear-4d":
    "https://www.savagegear.com/media/catalog/product/4/d/4d_perch_shad_12_5cm_10g_1.jpg",
};

export function getFallbackImage(productId: string): string | undefined {
  return defaultProductImages[productId];
}

import type { Metadata } from "next";

export const SITE_NAME = "ŁowimyOkazje.pl";

/** Kanoniczny adres — używany w podglądzie linków i SEO. */
export const SITE_HOST = "lowimyokazje.pl";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  `https://${SITE_HOST}`;

export const DEFAULT_TITLE = "ŁowimyOkazje.pl — Porównywarka cen wędkarskich";

export const DEFAULT_DESCRIPTION =
  "Porównuj ceny sprzętu wędkarskiego w 16 polskich sklepach. Wędki, kołowrotki, przynęty — znajdź najlepszą okazję.";

/** Logo używane w podglądzie linków (Messenger, WhatsApp, Facebook itd.) */
export const OG_IMAGE = {
  url: "/LOGO.png",
  width: 800,
  height: 800,
  alt: "ŁowimyOkazje.pl — porównywarka cen wędkarskich",
} as const;

const openGraphBase = {
  type: "website" as const,
  locale: "pl_PL",
  siteName: SITE_NAME,
  images: [OG_IMAGE],
};

const twitterBase = {
  card: "summary_large_image" as const,
  images: [OG_IMAGE.url],
};

/** Metadane podglądu linku z logo — dla podstron z własnym tytułem/opisem. */
export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
}: {
  title?: string;
  description?: string;
} = {}): Metadata {
  const resolvedTitle = title ?? DEFAULT_TITLE;

  return {
    ...(title ? { title } : {}),
    description,
    openGraph: {
      ...openGraphBase,
      title: resolvedTitle,
      description,
      url: SITE_URL,
    },
    twitter: {
      ...twitterBase,
      title: resolvedTitle,
      description,
    },
  };
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "wędkarstwo",
    "porównywarka cen",
    "sklep wędkarski",
    "promocje wędkarskie",
  ],
  openGraph: {
    ...openGraphBase,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    ...twitterBase,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  icons: {
    icon: [{ url: "/LOGO.png", type: "image/png" }],
    apple: [{ url: "/LOGO.png", type: "image/png" }],
  },
};

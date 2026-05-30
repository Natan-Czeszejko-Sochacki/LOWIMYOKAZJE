# ŁowimyOkazje.pl

Porównywarka cen wędkarskich — **wyłącznie 20 wybranych sklepów**, pełny katalog produktów ze **bezpośrednimi linkami** do kart produktów.

## Sklepy w porównywarce

AngryFish, Big Fish, CarpRide, Centrum Wędkarskie, E-Amur, Ehooks, FatFish, Feederland, Haczykowo, Karpiowa Chata, Karpiowy, MatchSklep, Moonfin, RM Rybka, Roach Shop, Rockworld, Sklep Drapieżnik, Sklep Miętus, Sklep Rybka, Wedkarski.

## Uruchomienie

```bash
npm install
# .env.local: DATABASE_URL z Supabase (Settings → Database → URI)
npm run dev
```

Otwórz http://localhost:3000 i kliknij **„Odśwież ceny”** — pierwsza synchronizacja pobiera produkty ze wszystkich sklepów (30–90 minut, zależnie od liczby produktów).

## Synchronizacja co 5 godzin

- Automatycznie przy działającym serwerze (`src/instrumentation.ts`)
- Na Vercel: `vercel.json` cron
- Ręcznie: `npm run sync` (serwer musi działać)

## Jak działają dane

1. Zbieranie URL-i produktów z sitemapów / kategorii każdego sklepu  
2. Pobranie strony produktu → **cena, zdjęcie, nazwa, link bezpośredni**  
3. Zapis w Supabase (Postgres) — lokalny import z `data/catalog.db` przez `npm run db:migrate`  
4. Grupowanie podobnych produktów (EAN lub znormalizowana nazwa) do porównania cen  

## Skrypty

```bash
# Pełna synchronizacja (przez API)
npm run sync

# Jeden sklep (test)
npx tsx scripts/test-sync.mjs wedkarski

# Limit produktów (test)
$env:CATALOG_SYNC_LIMIT=20; npx tsx scripts/test-sync.mjs carpride
```

## Produkcja

```bash
npm run build
npm start
```

Ustaw w Vercel: `DATABASE_URL` (pooler, port 6543) oraz opcjonalnie `CRON_SECRET` (patrz `.env.example`).

**Pierwszy import danych:** uruchom schemat `supabase/migrations/001_schema.sql` w Supabase SQL Editor, potem lokalnie `npm run db:migrate` (wymaga `data/catalog.db`).

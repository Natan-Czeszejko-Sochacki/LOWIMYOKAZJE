import Link from "next/link";

export const metadata = {
  title: "Regulamin serwisu",
};

export default function RegulaminPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Regulamin serwisu</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-water-400">
        <p>
          Serwis ŁowimyOkazje.pl to wyszukiwarka i porównywarka cen produktów wędkarskich.
          Nie prowadzimy sprzedaży, nie przyjmujemy płatności ani nie realizujemy dostaw —
          zakup odbywasz bezpośrednio u wybranego sklepu partnerskiego.
        </p>
        <p>
          Prezentowane ceny, dostępność i zdjęcia pochodzą ze sklepów zewnętrznych i mogą
          ulec zmianie. Przed zakupem zawsze sprawdź aktualną ofertę na stronie sprzedawcy.
        </p>
        <p>
          Korzystając z serwisu, akceptujesz, że linki prowadzą do witryn osób trzecich,
          za których treść i warunki sprzedaży odpowiadają wyłącznie te sklepy.
        </p>
        <p className="text-water-500">
          Pełna wersja regulaminu zostanie uzupełniona. W sprawach prawnych skontaktuj się
          z nami przez stronę{" "}
          <Link href="/kontakt" className="text-accent-500 hover:underline">
            Kontakt
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

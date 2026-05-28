import Link from "next/link";

export const metadata = {
  title: "Regulamin serwisu",
};

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">
        {number}. {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-water-400">{children}</div>
    </section>
  );
}

export default function RegulaminPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Regulamin serwisu ŁowimyOkazje.pl</h1>

      <div className="mt-6 space-y-3 text-sm leading-relaxed text-water-400">
        <p>
          Witamy w gronie świadomych wędkarzy! Serwis ŁowimyOkazje.pl to internetowa
          porównywarka cen sprzętu i akcesoriów wędkarskich. Poniższy regulamin określa
          zasady korzystania z naszego portalu. Korzystając z serwisu, akceptujesz jego
          postanowienia.
        </p>
      </div>

      <div className="mt-10 space-y-10">
        <Section number={1} title="Postanowienia ogólne">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Serwis ŁowimyOkazje.pl nie prowadzi bezpośredniej sprzedaży towarów, a jedynie
              agreguje i porównuje oferty sklepów wędkarskich.
            </li>
            <li>
              Korzystanie z podstawowych funkcji serwisu (przeglądanie i porównywanie ofert)
              jest całkowicie bezpłatne.
            </li>
          </ul>
        </Section>

        <Section number={2} title="Aktualność cen i odpowiedzialność">
          <ul className="space-y-4">
            <li>
              <p className="font-medium text-water-300">Częstotliwość odświeżania</p>
              <p className="mt-1">
                Dokładamy wszelkich starań, aby dane były jak najświeższe — ceny produktów są
                aktualizowane raz na dobę.
              </p>
            </li>
            <li>
              <p className="font-medium text-water-300">Ryzyko błędów</p>
              <p className="mt-1">
                Ze względu na dynamiczne zmiany w sklepach partnerskich lub przejściowe problemy
                techniczne, czasami może dojść do rozbieżności między ceną w naszym serwisie a
                ceną w sklepie docelowym. Wiążąca dla kupującego jest zawsze cena widoczna na
                stronie sklepu, w którym dokonuje się zakupu.
              </p>
            </li>
            <li>
              <p className="font-medium text-water-300">Zgłaszanie błędów</p>
              <p className="mt-1">
                Jeśli zauważysz „pustego brania” (błąd w cenie, zły link, błędny opis), zgłoś to
                nam! Wszystkie nieprawidłowości prosimy kierować na adres e-mail:{" "}
                <a
                  href="mailto:kontakt@lowimyokazje.pl"
                  className="text-accent-500 hover:underline"
                >
                  kontakt@lowimyokazje.pl
                </a>{" "}
                lub przez{" "}
                <Link href="/kontakt" className="text-accent-500 hover:underline">
                  formularz kontaktowy
                </Link>
                .
              </p>
            </li>
          </ul>
        </Section>

        <Section number={3} title="Rejestracja konta i ochrona danych">
          <p>
            Dla użytkowników, którzy chcą wycisnąć z portalu jak najwięcej (np. ustawiać alerty
            cenowe), przygotowaliśmy opcję rejestracji. Szanujemy Twoją prywatność, dlatego
            ograniczamy zbieranie danych do minimum:
          </p>
          <div>
            <p className="font-medium text-water-300">Zapisywane dane:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium text-water-300">Adres e-mail</strong> — niezbędny
                do logowania i wysyłania powiadomień.
              </li>
              <li>
                <strong className="font-medium text-water-300">Hasło</strong> — dla Twojego
                bezpieczeństwa jest ono bezwzględnie szyfrowane przy użyciu nowoczesnych
                algorytmów kryptograficznych. Nie znamy i nie widzimy Twojego hasła.
              </li>
              <li>
                <strong className="font-medium text-water-300">Adres IP</strong> — zapisywany
                automatycznie w logach serwera ze względów bezpieczeństwa (ochrona przed
                atakami botów i spamem).
              </li>
            </ul>
          </div>
          <p>
            Dane nie są odsprzedawane firmom trzecim. Służą wyłącznie do poprawnego działania
            funkcji serwisu.
          </p>
        </Section>

        <Section number={4} title="Funkcje dodatkowe dla społeczności">
          <p>
            Chcemy, aby ŁowimyOkazje.pl było najlepszym miejscem dla pasjonatów, dlatego w ramach
            konta użytkownicy zyskują dostęp do:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="font-medium text-water-300">Alertów cenowych</strong> — możliwość
              ustawienia powiadomienia e-mail, gdy cena wybranego wędziska lub kołowrotka spadnie
              poniżej określonego pułapu.
            </li>
            <li>
              <strong className="font-medium text-water-300">Wędkarskiego schowka (listy życzeń)</strong>{" "}
              — zapisywania ulubionych produktów „na później”, aby skompletować sprzęt przed
              nadchodzącym sezonem.
            </li>
          </ul>
        </Section>

        <Section number={5} title="Prawa autorskie i zasady korzystania">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Zabrania się automatycznego pobierania danych z serwisu (tzw. scraping) bez pisemnej
              zgody administratora.
            </li>
            <li>
              Wszystkie logotypy i nazwy marek sklepów trzecich są własnością ich prawnych
              właścicieli i zostały użyte wyłącznie w celach informacyjnych.
            </li>
          </ul>
        </Section>

        <Section number={6} title="Postanowienia końcowe">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Administrator zastrzega sobie prawo do przerw technicznych w działaniu serwisu
              (związanych z konserwacją sieci).
            </li>
            <li>
              Wszelkie pytania, uwagi oraz reklamacje dotyczące działania portalu można kierować na
              adres:{" "}
              <a
                href="mailto:kontakt@lowimyokazje.pl"
                className="text-accent-500 hover:underline"
              >
                kontakt@lowimyokazje.pl
              </a>
              .
            </li>
          </ul>
        </Section>
      </div>
    </div>
  );
}

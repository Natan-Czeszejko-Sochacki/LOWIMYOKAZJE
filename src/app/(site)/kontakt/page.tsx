import { ContactForm } from "@/components/ContactForm";

export const metadata = {
  title: "Kontakt",
};

export default function KontaktPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">Kontakt</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4 text-sm leading-relaxed text-water-400">
          <p>
            ŁowimyOkazje.pl to wyszukiwarka cen — nie jesteśmy sklepem. Jeśli masz pytania
            o działanie serwisu lub współpracę ze sklepami, napisz do nas.
          </p>
          <p>
            <strong className="font-semibold text-water-300">
              Znalazłeś błąd w cenie, nazwie produktu lub linku?
            </strong>{" "}
            Skontaktuj się z nami mailowo albo przez formularz obok — opisz, co jest nie tak
            (najlepiej z linkiem do produktu), a poprawimy dane.
          </p>
          <p>
            <span className="font-medium text-water-300">E-mail:</span>{" "}
            <a
              href="mailto:kontakt@lowimyokazje.pl"
              className="text-accent-500 hover:underline"
            >
              kontakt@lowimyokazje.pl
            </a>
          </p>
          <p className="text-water-500">
            Odpowiadamy w dni robocze, zwykle w ciągu 2–3 dni roboczych.
          </p>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}

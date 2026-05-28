"use client";

import { useState } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-water-700 bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-water-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Nie udało się wysłać formularza.");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorMessage("Błąd połączenia. Sprawdź internet i spróbuj ponownie.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-water-700 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-water-300">
            Imię / Firma <span className="text-accent-500">*</span>
          </span>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={200}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="Jan Kowalski lub nazwa firmy"
            disabled={status === "loading"}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-water-300">
            Adres e-mail <span className="text-accent-500">*</span>
          </span>
          <input
            type="email"
            name="email"
            required
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="twoj@email.pl"
            disabled={status === "loading"}
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-water-300">
            Treść formularza <span className="text-accent-500">*</span>
          </span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-y`}
            placeholder="Opisz błąd lub pytanie…"
            disabled={status === "loading"}
          />
        </label>
      </div>

      {status === "error" && errorMessage && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      {status === "success" && (
        <p className="mt-4 text-sm text-accent-500" role="status">
          Dziękujemy — wiadomość została wysłana. Odpowiemy tak szybko, jak to możliwe.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-5 w-full rounded-lg bg-accent-500 px-4 py-3 text-sm font-semibold text-white hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "loading" ? "Wysyłanie…" : "Wyślij formularz"}
      </button>
    </form>
  );
}

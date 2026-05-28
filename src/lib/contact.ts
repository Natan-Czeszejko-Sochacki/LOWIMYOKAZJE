import { getDb } from "./db";

export type ContactFormPayload = {
  name: string;
  email: string;
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(payload: ContactFormPayload): string | null {
  const name = payload.name.trim();
  const email = payload.email.trim();
  const message = payload.message.trim();

  if (name.length < 2 || name.length > 200) {
    return "Podaj imię lub nazwę firmy (2–200 znaków).";
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return "Podaj prawidłowy adres e-mail.";
  }
  if (message.length < 10 || message.length > 5000) {
    return "Treść wiadomości: od 10 do 5000 znaków.";
  }
  return null;
}

export function saveContactMessage(payload: ContactFormPayload): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO contact_messages (name, email, message, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(
    payload.name.trim(),
    payload.email.trim().toLowerCase(),
    payload.message.trim(),
    new Date().toISOString()
  );
}

import { NextRequest, NextResponse } from "next/server";
import { saveContactMessage, validateContactForm } from "@/lib/contact";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Nieprawidłowe dane formularza." }, { status: 400 });
  }

  const payload = {
    name: typeof (body as { name?: unknown }).name === "string" ? (body as { name: string }).name : "",
    email:
      typeof (body as { email?: unknown }).email === "string" ? (body as { email: string }).email : "",
    message:
      typeof (body as { message?: unknown }).message === "string"
        ? (body as { message: string }).message
        : "",
  };

  const error = validateContactForm(payload);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  try {
    saveContactMessage(payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Nie udało się wysłać wiadomości. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}

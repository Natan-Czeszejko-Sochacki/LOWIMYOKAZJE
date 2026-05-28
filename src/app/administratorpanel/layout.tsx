import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel administratora",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-water-900 text-foreground">{children}</div>
  );
}

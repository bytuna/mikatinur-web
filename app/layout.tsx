import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mikat-ı Nur",
  description: "Dijital Ekosistem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
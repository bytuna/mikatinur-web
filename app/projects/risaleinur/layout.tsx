import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Risale-i Nur Külliyatı, Evrad ve Kütüb-i Sitte Kütüphanesi",
  description:
    "15 ciltlik Risale-i Nur Külliyatı, Kur'an-ı Kerîm, Cevşen, Evrad ve Ezkâr, Muhtelif Eserler ve 17 ciltlik Kütüb-i Sitte'yi interaktif Osmanlıca-Türkçe lügat ve fihrist eşliğinde ücretsiz okuyun.",
  alternates: {
    canonical: "/projects/risaleinur",
  },
};

export default function RisaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}

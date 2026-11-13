import type { Metadata } from "next";
import DiniGunlerClient from "../namaz-vakti/DiniGunlerClient";
import { getRamadanImsakiye, getReligiousDays } from "@/lib/prayer/religious-days";
import { DEFAULT_ID, resolveLists } from "@/lib/prayer/places";
import type { InitialLists } from "@/lib/prayer/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dini Günler & Ramazan İmsakiyesi",
  description:
    "Diyanet İşleri Başkanlığı resmi verileriyle 2026 ve 2027 dini günler ve geceler takvimi, sıradaki kandil/bayram geri sayımı ve il/ilçe bazlı Ramazan İmsakiyesi.",
  alternates: { canonical: "/projects/dini-gunler/" },
};

export default async function DiniGunlerPage() {
  const [{ days, source }, initialRamadan] = await Promise.all([
    getReligiousDays(),
    getRamadanImsakiye(DEFAULT_ID, 2027),
  ]);

  let lists: InitialLists | null = null;
  if (initialRamadan?.place) {
    try {
      lists = await resolveLists(initialRamadan.place);
    } catch {
      lists = null;
    }
  }

  return (
    <DiniGunlerClient
      initialDays={days}
      initialSource={source}
      initialRamadan={initialRamadan}
      initialLists={lists}
    />
  );
}

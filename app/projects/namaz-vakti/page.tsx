import type { Metadata } from "next";
import NamazVaktiClient from "./NamazVaktiClient";
import { getMonth } from "@/lib/prayer/service";
import { DEFAULT_ID, resolveLists } from "@/lib/prayer/places";
import type { InitialLists, MonthResponse } from "@/lib/prayer/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Namaz Vakitleri",
  description:
    "Türkiye ve dünyanın dört bir yanı için güncel namaz vakitleri: imsak, güneş, öğle, ikindi, akşam, yatsı. Aylık vakit tablosu, hicri tarih ve kıble yönü.",
  alternates: { canonical: "/projects/namaz-vakti/" },
};

export default async function NamazVaktiPage() {
  let initial: MonthResponse | null = null;
  let lists: InitialLists | null = null;

  try {
    initial = await getMonth(DEFAULT_ID);
  } catch {
    initial = null;
  }

  if (initial) {
    try {
      lists = await resolveLists(initial.place);
    } catch {
      lists = null;
    }
  }

  return <NamazVaktiClient initial={initial} initialLists={lists} defaultId={DEFAULT_ID} />;
}

import { NextResponse } from "next/server";
import { getRamadanImsakiye, getReligiousDays } from "@/lib/prayer/religious-days";
import { DEFAULT_ID } from "@/lib/prayer/places";

/**
 * GET /projects/namaz-vakti/api/v1/dini-gunler/?placeId=9545&ramadanYear=2027
 */
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const placeId = sp.get("placeId") || DEFAULT_ID;
  const ramadanYear = Number(sp.get("ramadanYear")) === 2026 ? 2026 : 2027;

  try {
    const [religiousData, ramadan] = await Promise.all([
      getReligiousDays(),
      getRamadanImsakiye(placeId, ramadanYear),
    ]);

    return NextResponse.json(
      {
        days: religiousData.days,
        source: religiousData.source,
        ramadan,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Dini günler ve imsakiye verisi alınamadı" }, { status: 500 });
  }
}

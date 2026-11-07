import { hijriDateTr, hijriShort } from "@/lib/prayer/engine";
import { getDiyanetWindow, type RawVakit } from "@/lib/prayer/places";
import { getMonth } from "@/lib/prayer/service";
import type { DayRow } from "@/lib/prayer/types";

/**
 * Mevcut Android uygulamasının beklediği biçimde (emushaf /vakitler/{id} ile aynı alanlar) çıktı verir.
 * GET /projects/namaz-vakti/api/v1/compat/vakitler/?id=9545
 * Bugünden başlayarak ~31 gün döner.
 */

const TR_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];
const TR_DAYS = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

function nextMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, "0")}`;
}

function rawKey(r: RawVakit): string | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec((r.MiladiTarihKisa ?? "").trim());
  return m ? `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}` : null;
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const headers = { "Content-Type": "application/json; charset=utf-8" };
  if (!/^\d{1,7}$/.test(id)) {
    return new Response(JSON.stringify({ error: "id gerekli" }), {
      status: 400,
      headers: { ...headers, "Cache-Control": "no-store" },
    });
  }
  try {
    const a = await getMonth(id);
    if (!a) {
      return new Response(JSON.stringify({ error: "Yer bulunamadı" }), {
        status: 404,
        headers: { ...headers, "Cache-Control": "no-store" },
      });
    }
    const b = await getMonth(id, nextMonth(a.month));
    const rows: DayRow[] = [...a.days, ...(b ? b.days : [])].filter((d) => d.date >= a.today).slice(0, 31);

    // Ay şekli ve kıble saati gibi ek alanlar Diyanet penceresinde varsa oradan alınır
    const extra = new Map<string, RawVakit & { KibleSaati?: string; AyinSekliURL?: string; HicriTarihKisa?: string }>();
    if (a.place.method === "diyanet") {
      try {
        for (const r of await getDiyanetWindow(id)) {
          const k = rawKey(r);
          if (k) extra.set(k, r as RawVakit & { KibleSaati?: string; AyinSekliURL?: string; HicriTarihKisa?: string });
        }
      } catch {
        /* ek alanlar boş kalır */
      }
    }

    const out = rows.map((d) => {
      const [y, m, day] = d.date.split("-").map(Number);
      const wd = new Date(Date.UTC(y, m - 1, day, 12)).getUTCDay();
      const ex = extra.get(d.date);
      const dd = String(day).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      return {
        Imsak: d.imsak,
        Gunes: d.gunes,
        Ogle: d.ogle,
        Ikindi: d.ikindi,
        Aksam: d.aksam,
        Yatsi: d.yatsi,
        KibleSaati: ex?.KibleSaati ?? "",
        MiladiTarihKisa: `${dd}.${mm}.${y}`,
        MiladiTarihUzun: `${day} ${TR_MONTHS[m - 1]} ${y} ${TR_DAYS[wd]}`,
        HicriTarihKisa: ex?.HicriTarihKisa || hijriShort(y, m, day),
        HicriTarihUzun: ex?.HicriTarihUzun || d.hicri || hijriDateTr(y, m, day),
        AyinSekliURL: ex?.AyinSekliURL ?? "",
      };
    });

    return new Response(JSON.stringify(out), {
      status: 200,
      headers: { ...headers, "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Hesaplanamadı" }), {
      status: 500,
      headers: { ...headers, "Cache-Control": "no-store" },
    });
  }
}

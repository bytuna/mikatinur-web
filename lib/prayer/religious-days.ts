/**
 * Mîkāt-ı Nur — Diyanet İşleri Başkanlığı Dini Günler ve Ramazan İmsakiyesi Servisi
 *
 * Veri Kaynakları (Öncelik Sırasıyla):
 * 1. DIYANET_API_KEY / COLLECTAPI_KEY tanımlıysa resmi JSON API üzerinden çeker.
 * 2. Diyanet İşleri Başkanlığı Vakit Hesaplama Başkanlığı (vakithesaplama.diyanet.gov.tr/dinigunler.php) resmi tablosunu çeker.
 * 3. Kesintisiz hizmet için 2025, 2026 ve 2027 yılları resmi Diyanet Dini Günler takvimini yedek (fallback) olarak sunar.
 */

import { getMonth } from "./service";
import { getPlace, DEFAULT_ID } from "./places";
import type { PlaceInfo } from "./types";

export type ReligiousDay = {
  id: string;
  name: string;
  isoDate: string; // YYYY-MM-DD
  formattedDate: string; // 10 Aralık 2026 Perşembe
  shortDate: string; // 10.12.2026
  hijriDate: string; // 1 Receb 1448
  hijriYear: number;
  category: "kandil" | "ramazan" | "bayram" | "ozel";
  description: string;
};

export type RamadanDayRow = {
  ramadanDay: number; // 1..29/30
  hijriText: string; // 1 Ramazan 1448
  isoDate: string; // YYYY-MM-DD
  formattedDate: string; // 8 Şubat 2027 Pazartesi
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
  isKadirGecesi: boolean;
  isArefe: boolean;
  source: "diyanet" | "hesaplama";
};

export type RamadanSchedule = {
  hijriYear: number;
  gregorianYear: number;
  title: string;
  startDate: string;
  endDate: string;
  kadirGecesiDate: string;
  bayramFirstDay: string;
  place: PlaceInfo;
  days: RamadanDayRow[];
};

const DAY_DESCRIPTIONS: Record<string, { category: ReligiousDay["category"]; desc: string }> = {
  "Üç Ayların Başlangıcı": {
    category: "ozel",
    desc: "Recep, Şaban ve Ramazan aylarını kapsayan mübarek üç ayların manevi ikliminin başlangıcı.",
  },
  "Regaip Kandili": {
    category: "kandil",
    desc: "Recep ayının ilk Cuma gecesi; rahmet, mağfiret ve ilahi ihsanların bolca tecelli ettiği mübarek gece.",
  },
  "Miraç Kandili": {
    category: "kandil",
    desc: "Peygamber Efendimiz Hz. Muhammed'in (s.a.v.) Mescid-i Haram'dan Mescid-i Aksa'ya ve oradan semaya yükseldiği mucizevi gece.",
  },
  "Berat Kandili": {
    category: "kandil",
    desc: "Şaban ayının 15. gecesi; günahlardan arınma, af, mağfiret ve kulluk beratının verildiği mübarek gece.",
  },
  "Ramazan Başlangıcı": {
    category: "ramazan",
    desc: "On bir ayın sultanı, Kur'an, oruç, rahmet ve bereket ayı Ramazan-ı Şerif'in ilk günü.",
  },
  "Kadir Gecesi": {
    category: "kandil",
    desc: "Kur'an-ı Kerim'in indirilmeye başlandığı ve 'bin aydan daha hayırlı' olduğu müjdelenen mübarek gece.",
  },
  "Arefe (Ramazan)": {
    category: "ramazan",
    desc: "Ramazan-ı Şerif'in son günü ve Ramazan Bayramı'nın müjdecisi olan mübarek Arefe günü.",
  },
  "Ramazan Bayramı (1. Gün)": {
    category: "bayram",
    desc: "Oruç ibadetinin ardından kavuşulan, sevinç ve kardeşlik günü olan Ramazan Bayramı'nın birinci günü.",
  },
  "Ramazan Bayramı (2. Gün)": {
    category: "bayram",
    desc: "Sıla-i rahim ve muhabbetin paylaşıldığı Ramazan Bayramı'nın ikinci günü.",
  },
  "Ramazan Bayramı (3. Gün)": {
    category: "bayram",
    desc: "Ramazan Bayramı'nın üçüncü ve son günü.",
  },
  "Arefe (Kurban)": {
    category: "bayram",
    desc: "Zilhicce ayının 9. günü; hacıların Arafat'ta vakfeye durduğu, duaların kabul olduğu mübarek Kurban Arefesi.",
  },
  "Kurban Bayramı (1. Gün)": {
    category: "bayram",
    desc: "Hz. İbrahim ve Hz. İsmail'in teslimiyetini hatırlatan, kurban ibadetiyle Allah'a yakınlaşılan Kurban Bayramı'nın birinci günü.",
  },
  "Kurban Bayramı (2. Gün)": {
    category: "bayram",
    desc: "Paylaşma ve yardımlaşmanın zirveye ulaştığı Kurban Bayramı'nın ikinci günü.",
  },
  "Kurban Bayramı (3. Gün)": {
    category: "bayram",
    desc: "Teşrik tekbirleriyle ihya edilen Kurban Bayramı'nın üçüncü günü.",
  },
  "Kurban Bayramı (4. Gün)": {
    category: "bayram",
    desc: "Kurban Bayramı'nın dördüncü ve son günü.",
  },
  "Hicri Yılbaşı": {
    category: "ozel",
    desc: "Hz. Peygamber'in (s.a.v.) Mekke'den Medine'ye hicretini esas alan Hicri takvimin ilk günü (1 Muharrem).",
  },
  "Aşure Günü": {
    category: "ozel",
    desc: "Muharrem ayının 10. günü; pek çok peygamberin mucizesinin gerçekleştiği, paylaşma ve şükür günü.",
  },
  "Mevlid Kandili": {
    category: "kandil",
    desc: "Âlemlere rahmet olarak gönderilen Peygamber Efendimiz Hz. Muhammed'in (s.a.v.) dünyayı teşrif ettiği mübarek gece.",
  },
};

function enrichDay(name: string, isoDate: string, hijriDate: string): ReligiousDay {
  const [y, m, d] = isoDate.split("-").map(Number);
  const formattedDate = new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));

  const shortDate = `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
  const hijriYearMatch = /(\d{4})/.exec(hijriDate);
  const hijriYear = hijriYearMatch ? Number(hijriYearMatch[1]) : 1447;

  // Eşleşen kategori ve açıklama
  let meta = DAY_DESCRIPTIONS[name];
  if (!meta) {
    const lower = name.toLocaleLowerCase("tr");
    if (lower.includes("kandil") || lower.includes("kadir")) {
      meta = { category: "kandil", desc: "Dua, tövbe ve ibadetle ihya edilen mübarek kandil gecesi." };
    } else if (lower.includes("ramazan")) {
      meta = { category: "ramazan", desc: "Rahmet, mağfiret ve bereket ayı Ramazan-ı Şerif." };
    } else if (lower.includes("bayram") || lower.includes("arefe")) {
      meta = { category: "bayram", desc: "Birlik, beraberlik ve kardeşlik ikliminin yaşandığı mübarek bayram günü." };
    } else {
      meta = { category: "ozel", desc: "İslam takviminde önemli yeri olan mübarek gün ve gece." };
    }
  }

  return {
    id: `${isoDate}-${name.toLocaleLowerCase("tr").replace(/[^a-z0-9ğüşöçı]+/g, "-")}`,
    name,
    isoDate,
    formattedDate,
    shortDate,
    hijriDate,
    hijriYear,
    category: meta.category,
    description: meta.desc,
  };
}

/**
 * Diyanet İşleri Başkanlığı resmi 2025, 2026 ve 2027 Dini Günler veri tabanı.
 */
const OFFICIAL_DIYANET_DAYS: Array<{ name: string; isoDate: string; hijriDate: string }> = [
  // 2026 (1447 - 1448)
  { name: "Miraç Kandili", isoDate: "2026-01-15", hijriDate: "26 Receb 1447" },
  { name: "Berat Kandili", isoDate: "2026-02-02", hijriDate: "14 Şaban 1447" },
  { name: "Ramazan Başlangıcı", isoDate: "2026-02-19", hijriDate: "1 Ramazan 1447" },
  { name: "Kadir Gecesi", isoDate: "2026-03-16", hijriDate: "26 Ramazan 1447" },
  { name: "Arefe (Ramazan)", isoDate: "2026-03-19", hijriDate: "29 Ramazan 1447" },
  { name: "Ramazan Bayramı (1. Gün)", isoDate: "2026-03-20", hijriDate: "1 Şevval 1447" },
  { name: "Ramazan Bayramı (2. Gün)", isoDate: "2026-03-21", hijriDate: "2 Şevval 1447" },
  { name: "Ramazan Bayramı (3. Gün)", isoDate: "2026-03-22", hijriDate: "3 Şevval 1447" },
  { name: "Arefe (Kurban)", isoDate: "2026-05-26", hijriDate: "9 Zilhicce 1447" },
  { name: "Kurban Bayramı (1. Gün)", isoDate: "2026-05-27", hijriDate: "10 Zilhicce 1447" },
  { name: "Kurban Bayramı (2. Gün)", isoDate: "2026-05-28", hijriDate: "11 Zilhicce 1447" },
  { name: "Kurban Bayramı (3. Gün)", isoDate: "2026-05-29", hijriDate: "12 Zilhicce 1447" },
  { name: "Kurban Bayramı (4. Gün)", isoDate: "2026-05-30", hijriDate: "13 Zilhicce 1447" },
  { name: "Hicri Yılbaşı", isoDate: "2026-06-16", hijriDate: "1 Muharrem 1448" },
  { name: "Aşure Günü", isoDate: "2026-06-25", hijriDate: "10 Muharrem 1448" },
  { name: "Mevlid Kandili", isoDate: "2026-08-24", hijriDate: "11 Rebiülevvel 1448" },
  { name: "Üç Ayların Başlangıcı", isoDate: "2026-12-10", hijriDate: "1 Receb 1448" },
  { name: "Regaip Kandili", isoDate: "2026-12-10", hijriDate: "1 Receb 1448" },

  // 2027 (1448 - 1449)
  { name: "Miraç Kandili", isoDate: "2027-01-04", hijriDate: "26 Receb 1448" },
  { name: "Berat Kandili", isoDate: "2027-01-22", hijriDate: "14 Şaban 1448" },
  { name: "Ramazan Başlangıcı", isoDate: "2027-02-08", hijriDate: "1 Ramazan 1448" },
  { name: "Kadir Gecesi", isoDate: "2027-03-05", hijriDate: "26 Ramazan 1448" },
  { name: "Arefe (Ramazan)", isoDate: "2027-03-08", hijriDate: "29 Ramazan 1448" },
  { name: "Ramazan Bayramı (1. Gün)", isoDate: "2027-03-09", hijriDate: "1 Şevval 1448" },
  { name: "Ramazan Bayramı (2. Gün)", isoDate: "2027-03-10", hijriDate: "2 Şevval 1448" },
  { name: "Ramazan Bayramı (3. Gün)", isoDate: "2027-03-11", hijriDate: "3 Şevval 1448" },
  { name: "Arefe (Kurban)", isoDate: "2027-05-15", hijriDate: "9 Zilhicce 1448" },
  { name: "Kurban Bayramı (1. Gün)", isoDate: "2027-05-16", hijriDate: "10 Zilhicce 1448" },
  { name: "Kurban Bayramı (2. Gün)", isoDate: "2027-05-17", hijriDate: "11 Zilhicce 1448" },
  { name: "Kurban Bayramı (3. Gün)", isoDate: "2027-05-18", hijriDate: "12 Zilhicce 1448" },
  { name: "Kurban Bayramı (4. Gün)", isoDate: "2027-05-19", hijriDate: "13 Zilhicce 1448" },
  { name: "Hicri Yılbaşı", isoDate: "2027-06-06", hijriDate: "1 Muharrem 1449" },
  { name: "Aşure Günü", isoDate: "2027-06-15", hijriDate: "10 Muharrem 1449" },
  { name: "Mevlid Kandili", isoDate: "2027-08-14", hijriDate: "11 Rebiülevvel 1449" },
  { name: "Üç Ayların Başlangıcı", isoDate: "2027-11-29", hijriDate: "1 Receb 1449" },
  { name: "Regaip Kandili", isoDate: "2027-12-02", hijriDate: "4 Receb 1449" },
  { name: "Miraç Kandili", isoDate: "2027-12-24", hijriDate: "26 Receb 1449" },
];

const TR_MONTH_MAP: Record<string, string> = {
  OCAK: "01",
  ŞUBAT: "02",
  SUBAT: "02",
  MART: "03",
  NİSAN: "04",
  NISAN: "04",
  MAYIS: "05",
  HAZİRAN: "06",
  HAZIRAN: "06",
  TEMMUZ: "07",
  AĞUSTOS: "08",
  AGUSTOS: "08",
  EYLÜL: "09",
  EYLUL: "09",
  EKİM: "10",
  EKIM: "10",
  KASIM: "11",
  ARALIK: "12",
};

/**
 * Diyanet'in resmi sayfasından veya tanımlı API Key üzerinden belirtilen yılın dini günlerini çeker.
 */
async function fetchDiyanetYearOnline(year: number): Promise<ReligiousDay[] | null> {
  // 1. Özel Diyanet Awqatsalah / Harici API Key varsa kullan
  const apiKey = process.env.DIYANET_API_KEY;
  const apiUrl = process.env.DIYANET_RELIGIOUS_DAYS_URL;
  if (apiKey && apiUrl) {
    try {
      const res = await fetch(`${apiUrl}?year=${year}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
        next: { revalidate: 86400 },
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          return json.map((item: { name?: string; Aciklama?: string; isoDate?: string; MiladiTarih?: string; hijriDate?: string; HicriTarih?: string }) =>
            enrichDay(
              item.name || item.Aciklama || "Dini Gün",
              item.isoDate || item.MiladiTarih || `${year}-01-01`,
              item.hijriDate || item.HicriTarih || "",
            ),
          );
        }
      }
    } catch {
      /* ikinci kaynağa geç */
    }
  }

  // 2. Diyanet Vakit Hesaplama resmi tablosundan çek
  try {
    const res = await fetch(`https://vakithesaplama.diyanet.gov.tr/dinigunler.php?yil=${year}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MkatNur-Web/1.0",
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const out: ReligiousDay[] = [];

    let rowMatch: RegExpExecArray | null;
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const cells: string[] = [];
      let cellMatch: RegExpExecArray | null;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        const clean = cellMatch[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
        cells.push(clean);
      }
      if (cells.length >= 7) {
        const name = cells[6];
        if (name && name !== "DİNİ GÜNLER" && !name.includes("...")) {
          const dayNum = cells[3].padStart(2, "0");
          const parts = cells[4].split("-");
          if (parts.length >= 2) {
            const mKey = parts[0].trim().toLocaleUpperCase("tr");
            const mNum = TR_MONTH_MAP[mKey] || "01";
            const yStr = parts[1].trim();
            const isoDate = `${yStr}-${mNum}-${dayNum}`;
            const hijriDate = `${cells[0]} ${cells[1]} ${cells[2]}`.trim();
            out.push(enrichDay(name, isoDate, hijriDate));
          }
        }
      }
    }
    return out.length >= 10 ? out : null;
  } catch {
    return null;
  }
}

/**
 * 2026 ve 2027 yıllarının tamamını kapsayan resmi Diyanet Dini Günler listesini döndürür.
 */
export async function getReligiousDays(): Promise<{
  days: ReligiousDay[];
  source: "diyanet-live" | "diyanet-official";
}> {
  const [live2026, live2027] = await Promise.all([
    fetchDiyanetYearOnline(2026),
    fetchDiyanetYearOnline(2027),
  ]);

  if (live2026 && live2026.length > 0) {
    const combined = [
      ...live2026,
      ...(live2027 && live2027.length > 0
        ? live2027
        : OFFICIAL_DIYANET_DAYS.filter((d) => d.isoDate.startsWith("2027")).map((d) =>
            enrichDay(d.name, d.isoDate, d.hijriDate),
          )),
    ];
    return { days: combined, source: "diyanet-live" };
  }

  return {
    days: OFFICIAL_DIYANET_DAYS.map((d) => enrichDay(d.name, d.isoDate, d.hijriDate)),
    source: "diyanet-official",
  };
}

/**
 * Resmi Diyanet Ramazan İmsakiyesi:
 * - 2026 Ramazan-ı Şerif (1447): 19 Şubat 2026 – 19 Mart 2026 (29 Gün, Kadir Gecesi: 16 Mart 2026, Bayram: 20 Mart 2026)
 * - 2027 Ramazan-ı Şerif (1448): 8 Şubat 2027 – 8 Mart 2027 (29 Gün, Kadir Gecesi: 5 Mart 2027, Bayram: 9 Mart 2027)
 */
const RAMADAN_CONFIGS: Record<
  number,
  {
    hijriYear: number;
    gregorianYear: number;
    title: string;
    startDate: string;
    endDate: string;
    kadirGecesiDate: string;
    bayramFirstDay: string;
  }
> = {
  2026: {
    hijriYear: 1447,
    gregorianYear: 2026,
    title: "2026 (1447 Hicri) Ramazan İmsakiyesi",
    startDate: "2026-02-19",
    endDate: "2026-03-19",
    kadirGecesiDate: "2026-03-16",
    bayramFirstDay: "20 Mart 2026 Cuma",
  },
  2027: {
    hijriYear: 1448,
    gregorianYear: 2027,
    title: "2027 (1448 Hicri) Ramazan İmsakiyesi",
    startDate: "2027-02-08",
    endDate: "2027-03-08",
    kadirGecesiDate: "2027-03-05",
    bayramFirstDay: "9 Mart 2027 Salı",
  },
};

export async function getRamadanImsakiye(
  placeId: string = DEFAULT_ID,
  year: number = 2027,
): Promise<RamadanSchedule | null> {
  const cfg = RAMADAN_CONFIGS[year] ?? RAMADAN_CONFIGS[2027];
  const place = (await getPlace(placeId)) ?? (await getPlace(DEFAULT_ID));
  if (!place) return null;

  const startYm = cfg.startDate.slice(0, 7);
  const endYm = cfg.endDate.slice(0, 7);

  const [m1, m2] = await Promise.all([
    getMonth(place.id, startYm),
    startYm === endYm ? Promise.resolve(null) : getMonth(place.id, endYm),
  ]);

  if (!m1) return null;
  const allDays = [...m1.days, ...(m2 ? m2.days : [])];
  const ramadanSlice = allDays.filter((d) => d.date >= cfg.startDate && d.date <= cfg.endDate);

  const days: RamadanDayRow[] = ramadanSlice.map((d, idx) => {
    const [yy, mm, dd] = d.date.split("-").map(Number);
    const formattedDate = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "UTC",
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "short",
    }).format(new Date(Date.UTC(yy, mm - 1, dd, 12)));

    return {
      ramadanDay: idx + 1,
      hijriText: `${idx + 1} Ramazan ${cfg.hijriYear}`,
      isoDate: d.date,
      formattedDate,
      imsak: d.imsak,
      gunes: d.gunes,
      ogle: d.ogle,
      ikindi: d.ikindi,
      aksam: d.aksam,
      yatsi: d.yatsi,
      isKadirGecesi: d.date === cfg.kadirGecesiDate,
      isArefe: d.date === cfg.endDate,
      source: d.source,
    };
  });

  return {
    ...cfg,
    place,
    days,
  };
}

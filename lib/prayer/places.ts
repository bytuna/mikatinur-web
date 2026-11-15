import tzlookup from "tz-lookup";
import lookupData from "./lookup.json";
import { qiblaBearing, type Method } from "./engine";
import type { Option, PlaceInfo } from "./types";

const BASE = "https://ezanvakti.emushaf.net";

/** Mekke ve Medine ilçe kimlikleri (Diyanet): Ümmü'l-Kurâ kullanılır. */
export const UMMALQURA_IDS = new Set(["16309", "16308"]);

/** Varsayılan yer: İstanbul / Pendik. Arama servisi erişilemezse bile çalışsın diye yedek. */
export const DEFAULT_ID = "9545";
const FALLBACK_PLACES: Record<string, PlaceInfo> = {
  "9545": {
    id: "9545",
    name: "Pendik",
    city: "İstanbul",
    country: "Türkiye",
    lat: 40.8767,
    lon: 29.2333,
    tz: "Europe/Istanbul",
    method: "diyanet",
    qibla: qiblaBearing(40.8767, 29.2333),
    approx: 0,
  },
};

/* ------------------------------------------------------------------ */
/* Basit bellek önbelleği                                              */
/* ------------------------------------------------------------------ */
type Entry = { exp: number; value: Promise<unknown> };
const memo = new Map<string, Entry>();

function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = memo.get(key);
  if (hit && hit.exp > now) return hit.value as Promise<T>;
  const p = loader();
  memo.set(key, { exp: now + ttlMs, value: p });
  p.catch(() => {
    const cur = memo.get(key);
    if (cur && cur.value === p) memo.delete(key);
  });
  return p;
}

export async function getJson<T>(path: string, timeoutMs = 10000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, {
      cache: "no-store",
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MkatNur-Web/1.0" },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */
export function norm(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * "İSTANBUL" → "İstanbul"; zaten karışık harfliyse dokunmaz.
 * loc="tr": Türkçe büyük/küçük harf kuralı (Türkiye, ülke adları); loc="en": yabancı Latin adlar ("BERLIN" → "Berlin").
 */
export function titleTr(s: string, loc: "tr" | "en" = "tr"): string {
  const t = (s || "").trim();
  if (!t) return t;
  if (t !== t.toLocaleUpperCase(loc)) return t;
  return t
    .toLocaleLowerCase(loc)
    .split(/(\s+|-|\/)/)
    .map((w) => (w.length > 0 ? w.charAt(0).toLocaleUpperCase(loc) + w.slice(1) : w))
    .join("");
}

function sortTr(list: Option[]): Option[] {
  return list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

/* ------------------------------------------------------------------ */
/* Ülke / il / ilçe listeleri                                          */
/* ------------------------------------------------------------------ */
export function getCountries(): Promise<Option[]> {
  return cached("countries", 12 * 3600e3, async () => {
    const seen = new Map<string, string>();
    for (const r of LOOKUP) if (!seen.has(r[8])) seen.set(r[8], r[3]);
    return sortTr([...seen].map(([id, name]) => ({ id, name: titleTr(name) })));
  });
}

export function getRegions(countryId: string): Promise<Option[]> {
  return cached("regions:" + countryId, 12 * 3600e3, async () => {
    const loc = locFor(countryId);
    const seen = new Map<string, string>();
    for (const r of LOOKUP) if (r[8] === countryId && !seen.has(r[7])) seen.set(r[7], r[2]);
    return sortTr([...seen].map(([id, name]) => ({ id, name: titleTr(name, loc) })));
  });
}

export function getDistricts(regionId: string): Promise<Option[]> {
  return cached("districts:" + regionId, 12 * 3600e3, async () => {
    const loc = locFor(REGION_COUNTRY.get(regionId));
    const out: Option[] = [];
    for (const r of LOOKUP) {
      if (r[7] === regionId && !LEGACY_METRO_CENTER_IDS.has(r[0])) {
        out.push({ id: r[0], name: titleTr(r[1], loc) });
      }
    }
    return sortTr(out);
  });
}

/* ------------------------------------------------------------------ */
/* Yer bilgisi (koordinat, saat dilimi)                                */
/* ------------------------------------------------------------------ */
/** [ilceId, ilce, il, ülke, lat, lon, approx, ilId, ülkeId] */
type LookupRow = [string, string, string, string, number, number, number, string, string];

const LOOKUP = lookupData as unknown as LookupRow[];
const LOOKUP_MAP = new Map<string, LookupRow>(LOOKUP.map((r) => [r[0], r]));
const REGION_COUNTRY = new Map<string, string>(LOOKUP.map((r) => [r[7], r[8]]));

/**
 * 30 büyükşehirde eski Diyanet genel merkez kayıtları (ör. İstanbul altında "İSTANBUL", Ankara altında "ANKARA").
 * Açılır listede resmi 973 ilçenin görünmesi için gizlenir; Android/Web geriye dönük uyumluluğu için LOOKUP_MAP'te korunur.
 */
const LEGACY_METRO_CENTER_IDS = new Set([
  "9146", "9206", "9225", "9252", "9270", "9335", "9392", "9402", "9451", "9470",
  "9479", "20089", "9541", "9560", "9577", "9620", "9654", "9676", "9703", "9716",
  "9726", "9737", "9747", "9782", "9807", "9819", "9831", "9879", "9905", "9930",
]);

/**
 * 81 ilin (500..580) Diyanet İşleri Başkanlığı il merkezi ID eşleştirmesi.
 * Diyanet'te merkezle birleştirilmiş olan 134 ilçe, resmi Diyanet vakitlerini bağlı oldukları il merkezinden alır.
 */
const REGION_DIYANET_CENTER_ID: Record<string, string> = {
  "500": "9146", "501": "9158", "502": "9167", "503": "9185", "504": "9193", "505": "9198",
  "506": "9206", "507": "9225", "508": "9238", "509": "9246", "510": "9252", "511": "9270",
  "512": "9285", "513": "9288", "514": "9295", "515": "9297", "516": "9303", "517": "9311",
  "518": "9315", "519": "9327", "520": "9335", "521": "9352", "522": "9359", "523": "9370",
  "524": "9392", "525": "9402", "526": "9414", "527": "9419", "528": "9432", "529": "9440",
  "530": "9451", "531": "9470", "532": "9479", "533": "9494", "534": "9501", "535": "9507",
  "536": "20089", "537": "9522", "538": "9528", "539": "9541", "540": "9560", "541": "9577",
  "542": "9581", "543": "9587", "544": "9594", "545": "9609", "546": "9620", "547": "9629",
  "548": "9635", "549": "9638", "550": "9646", "551": "9654", "552": "9676", "553": "9689",
  "554": "9703", "555": "9716", "556": "9726", "557": "9737", "558": "9747", "559": "9755",
  "560": "9760", "561": "9766", "562": "9782", "563": "9788", "564": "9799", "565": "9807",
  "566": "9819", "567": "9831", "568": "9839", "569": "9847", "570": "9854", "571": "9868",
  "572": "9879", "573": "9887", "574": "9905", "575": "9914", "576": "9919", "577": "9930",
  "578": "9935", "579": "9949", "580": "9955",
};

/** Türkiye'deki yer adları Türkçe kuralıyla, yabancı yerler İngilizce kuralıyla düzenlenir. */
const locFor = (countryId: string | undefined): "tr" | "en" => (countryId === "2" ? "tr" : "en");

/** Koordinata en yakın (kesin koordinatlı) ilçeyi bulur (dünya genelinde). */
export async function findNearest(
  lat: number,
  lon: number,
): Promise<{ id: string; name: string; city: string; country: string; distanceKm: number } | null> {
  const p1 = (lat * Math.PI) / 180;
  let best: LookupRow | null = null;
  let bestD = Infinity;
  for (const r of LOOKUP) {
    if (r[6] !== 0 || LEGACY_METRO_CENTER_IDS.has(r[0])) continue;
    const p2 = (r[4] * Math.PI) / 180;
    const dp = p2 - p1;
    const dl = ((r[5] - lon) * Math.PI) / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    const d = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  if (!best) return null;
  return {
    id: best[0],
    name: titleTr(best[1], locFor(best[8])),
    city: titleTr(best[2], locFor(best[8])),
    country: titleTr(best[3]),
    distanceKm: Math.round(bestD * 10) / 10,
  };
}

function zoneFor(countryId: string, lat: number, lon: number): string {
  if (countryId === "2") return "Europe/Istanbul";
  try {
    return tzlookup(lat, lon);
  } catch {
    return "UTC";
  }
}

export async function getPlace(id: string): Promise<PlaceInfo | null> {
  if (!/^\d{1,7}$/.test(id)) return null;
  const r = LOOKUP_MAP.get(id);
  if (r) {
    const [, ilce, il, ulke, lat, lon, approx, , ulkeId] = r;
    const method: Method = UMMALQURA_IDS.has(id) ? "ummalqura" : "diyanet";
    return {
      id,
      name: titleTr(ilce, locFor(ulkeId)),
      city: titleTr(il, locFor(ulkeId)),
      country: titleTr(ulke),
      lat,
      lon,
      tz: zoneFor(ulkeId, lat, lon),
      method,
      qibla: qiblaBearing(lat, lon),
      approx: approx === 0 ? 0 : approx === 2 ? 2 : 1,
    };
  }
  return FALLBACK_PLACES[id] ?? null;
}

/** Bir yerin ülke/il/ilçe listelerini ve seçili kimliklerini çözer (ilk yükleme için). */
export async function resolveLists(place: PlaceInfo) {
  const countries = await getCountries();
  const country = countries.find((c) => norm(c.name) === norm(place.country));
  if (!country) return null;
  const regions = await getRegions(country.id);
  const region = regions.find((r) => norm(r.name) === norm(place.city));
  if (!region) return { countries, regions, districts: [], countryId: country.id, regionId: "", districtId: "" };
  const districts = await getDistricts(region.id);
  const district = districts.find((d) => d.id === place.id) ?? districts[0];
  return {
    countries,
    regions,
    districts,
    countryId: country.id,
    regionId: region.id,
    districtId: district ? district.id : "",
  };
}

/* ------------------------------------------------------------------ */
/* Diyanet aylık veri penceresi                                        */
/* ------------------------------------------------------------------ */
export type RawVakit = {
  MiladiTarihKisa: string; // dd.mm.yyyy
  Imsak: string;
  Gunes: string;
  Ogle: string;
  Ikindi: string;
  Aksam: string;
  Yatsi: string;
  HicriTarihUzun?: string;
};

export function getDiyanetWindow(id: string): Promise<RawVakit[]> {
  const r = LOOKUP_MAP.get(id);
  const diyanetId = r && r[8] === "2" && Number(id) < 8000 ? (REGION_DIYANET_CENTER_ID[r[7]] ?? id) : id;
  return cached("vakit:" + diyanetId, 30 * 60e3, () => getJson<RawVakit[]>("/vakitler/" + diyanetId, 8000));
}

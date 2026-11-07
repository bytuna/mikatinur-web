import tzlookup from "tz-lookup";
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

async function getJson<T>(path: string, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(BASE + path, {
      cache: "no-store",
      signal: ctrl.signal,
      headers: { Accept: "application/json", "User-Agent": "MikatiNur-Web/1.0" },
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

/** "İSTANBUL" → "İstanbul"; zaten karışık harfliyse dokunmaz. */
export function titleTr(s: string): string {
  const t = (s || "").trim();
  if (!t) return t;
  if (t !== t.toLocaleUpperCase("tr")) return t;
  return t
    .toLocaleLowerCase("tr")
    .split(/(\s+|-|\/)/)
    .map((w) => (w.length > 0 ? w.charAt(0).toLocaleUpperCase("tr") + w.slice(1) : w))
    .join("");
}

function sortTr(list: Option[]): Option[] {
  return list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

/* ------------------------------------------------------------------ */
/* Ülke / il / ilçe listeleri                                          */
/* ------------------------------------------------------------------ */
type RawCountry = { UlkeAdi: string; UlkeAdiEn?: string; UlkeID: string };
type RawRegion = { SehirAdi: string; SehirAdiEn?: string; SehirID: string };
type RawDistrict = { IlceAdi: string; IlceAdiEn?: string; IlceID: string };

export function getCountries(): Promise<Option[]> {
  return cached("countries", 12 * 3600e3, async () => {
    const raw = await getJson<RawCountry[]>("/ulkeler");
    return sortTr(raw.map((c) => ({ id: String(c.UlkeID), name: titleTr(c.UlkeAdi) })));
  });
}

export function getRegions(countryId: string): Promise<Option[]> {
  return cached("regions:" + countryId, 12 * 3600e3, async () => {
    const raw = await getJson<RawRegion[]>("/sehirler/" + countryId);
    return sortTr(raw.map((c) => ({ id: String(c.SehirID), name: titleTr(c.SehirAdi) })));
  });
}

export function getDistricts(regionId: string): Promise<Option[]> {
  return cached("districts:" + regionId, 12 * 3600e3, async () => {
    const raw = await getJson<RawDistrict[]>("/ilceler/" + regionId);
    return sortTr(raw.map((c) => ({ id: String(c.IlceID), name: titleTr(c.IlceAdi) })));
  });
}

/* ------------------------------------------------------------------ */
/* Yer bilgisi (koordinat, saat dilimi)                                */
/* ------------------------------------------------------------------ */
type RawLookup = {
  UlkeAdi: string;
  SehirAdi: string;
  IlceAdi: string;
  IlceID: string;
  lat: number | string;
  lon: number | string;
};

function getLookupList(): Promise<RawLookup[]> {
  return cached("lookup", 12 * 3600e3, () => getJson<RawLookup[]>("/lookup", 20000));
}

function getLookupMap(): Promise<Map<string, RawLookup>> {
  return cached("lookup-map", 12 * 3600e3, async () => {
    const raw = await getLookupList();
    const map = new Map<string, RawLookup>();
    for (const r of raw) {
      const id = String(r.IlceID);
      if (!map.has(id)) map.set(id, r);
    }
    return map;
  });
}

/** Koordinata en yakın ilçeyi bulur (dünya genelinde). */
export async function findNearest(
  lat: number,
  lon: number,
): Promise<{ id: string; name: string; city: string; country: string; distanceKm: number } | null> {
  const list = await getLookupList();
  const p1 = (lat * Math.PI) / 180;
  let best: RawLookup | null = null;
  let bestD = Infinity;
  for (const r of list) {
    const la = Number(r.lat);
    const lo = Number(r.lon);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) continue;
    const p2 = (la * Math.PI) / 180;
    const dp = p2 - p1;
    const dl = ((lo - lon) * Math.PI) / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    const d = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  if (!best) return null;
  return {
    id: String(best.IlceID),
    name: titleTr(best.IlceAdi),
    city: titleTr(best.SehirAdi),
    country: titleTr(best.UlkeAdi),
    distanceKm: Math.round(bestD * 10) / 10,
  };
}

function zoneFor(country: string, lat: number, lon: number): string {
  if (norm(country) === "turkiye") return "Europe/Istanbul";
  try {
    return tzlookup(lat, lon);
  } catch {
    return "UTC";
  }
}

export async function getPlace(id: string): Promise<PlaceInfo | null> {
  if (!/^\d{1,7}$/.test(id)) return null;
  try {
    const map = await getLookupMap();
    const r = map.get(id);
    if (r) {
      const lat = Number(r.lat);
      const lon = Number(r.lon);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const method: Method = UMMALQURA_IDS.has(id) ? "ummalqura" : "diyanet";
        return {
          id,
          name: titleTr(r.IlceAdi),
          city: titleTr(r.SehirAdi),
          country: titleTr(r.UlkeAdi),
          lat,
          lon,
          tz: zoneFor(r.UlkeAdi, lat, lon),
          method,
          qibla: qiblaBearing(lat, lon),
        };
      }
    }
  } catch {
    /* yedeğe düş */
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
  const district = districts.find((d) => d.id === place.id);
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
  return cached("vakit:" + id, 30 * 60e3, () => getJson<RawVakit[]>("/vakitler/" + id, 8000));
}

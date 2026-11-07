import { computeDay, hijriDateTr, daysInMonth, type DayTimes } from "./engine";
import { getDiyanetWindow, getPlace, type RawVakit } from "./places";
import type { DayRow, MonthResponse, PlaceInfo } from "./types";

const DASH = "—";
const TIME_RE = /^\d{1,2}:\d{2}/;

function p2(n: number) {
  return n < 10 ? "0" + n : String(n);
}

export function isoDate(y: number, m: number, d: number) {
  return `${y}-${p2(m)}-${p2(d)}`;
}

/** Verilen saat diliminde bugünün tarihi. */
export function todayIn(tz: string, at = new Date()): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: g("year"), m: g("month"), d: g("day") };
}

function fromRaw(r: RawVakit): DayTimes | null {
  const t = [r.Imsak, r.Gunes, r.Ogle, r.Ikindi, r.Aksam, r.Yatsi].map((s) => (s ?? "").trim().slice(0, 5));
  if (!t.every((s) => TIME_RE.test(s))) return null;
  const f = (s: string) => (s.length === 4 ? "0" + s : s);
  return { imsak: f(t[0]), gunes: f(t[1]), ogle: f(t[2]), ikindi: f(t[3]), aksam: f(t[4]), yatsi: f(t[5]) };
}

function rawKey(r: RawVakit): string | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec((r.MiladiTarihKisa ?? "").trim());
  return m ? isoDate(Number(m[3]), Number(m[2]), Number(m[1])) : null;
}

function buildDay(place: PlaceInfo, y: number, m: number, d: number, diyanet: Map<string, RawVakit>): DayRow {
  const date = isoDate(y, m, d);
  const raw = diyanet.get(date);
  const rawTimes = raw ? fromRaw(raw) : null;
  if (raw && rawTimes) {
    return {
      date,
      ...rawTimes,
      hicri: (raw.HicriTarihUzun ?? "").trim() || hijriDateTr(y, m, d),
      source: "diyanet",
    };
  }
  const t = computeDay(y, m, d, { lat: place.lat, lon: place.lon, tz: place.tz, method: place.method });
  return {
    date,
    imsak: t?.imsak ?? DASH,
    gunes: t?.gunes ?? DASH,
    ogle: t?.ogle ?? DASH,
    ikindi: t?.ikindi ?? DASH,
    aksam: t?.aksam ?? DASH,
    yatsi: t?.yatsi ?? DASH,
    hicri: hijriDateTr(y, m, d),
    source: "hesaplama",
  };
}

/**
 * Bir ilçenin aylık vakitleri.
 * Mekke/Medine: Ümmü'l-Kurâ hesabı. Diğerleri: Diyanet verisi (varsa), yoksa Diyanet kuralıyla hesap.
 */
export async function getMonth(id: string, ym?: string | null): Promise<MonthResponse | null> {
  const place = await getPlace(id);
  if (!place) return null;

  const today = todayIn(place.tz);
  let y = today.y;
  let m = today.m;
  const mm = ym ? /^(\d{4})-(\d{2})$/.exec(ym) : null;
  if (mm) {
    const yy = Number(mm[1]);
    const mo = Number(mm[2]);
    if (yy >= 2000 && yy <= 2100 && mo >= 1 && mo <= 12) {
      y = yy;
      m = mo;
    }
  }

  const diyanet = new Map<string, RawVakit>();
  if (place.method === "diyanet") {
    try {
      const win = await getDiyanetWindow(id);
      for (const r of win) {
        const k = rawKey(r);
        if (k) diyanet.set(k, r);
      }
    } catch {
      /* Diyanet verisi alınamadı: hesaplama devreye girer */
    }
  }

  const days: DayRow[] = [];
  const n = daysInMonth(y, m);
  for (let d = 1; d <= n; d++) days.push(buildDay(place, y, m, d, diyanet));

  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  const after = buildDay(place, ny, nm, 1, diyanet);

  return {
    place,
    month: `${y}-${p2(m)}`,
    today: isoDate(today.y, today.m, today.d),
    days,
    after,
  };
}

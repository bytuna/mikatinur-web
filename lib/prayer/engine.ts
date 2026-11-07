/**
 * Mikat-ı Nur — namaz vakti hesap motoru (bağımlılıksız, saf fonksiyonlar).
 *
 * İki yöntem:
 *  - "diyanet"   : Diyanet İşleri Başkanlığı kuralı (İmsak 18°, Yatsı 17° / yüksek enlemde 16°,
 *                  güneş ufku -0.8333°, ikindi gölge katsayısı 1, Diyanet temkin süreleri).
 *  - "ummalqura" : Ümmü'l-Kurâ (Mekke/Medine): Fecr 18.5°, Yatsı = Akşam + 90 dk (Ramazan'da +120 dk).
 *
 * Sunucuda da istemcide de aynı kod çalışır.
 */

export type Method = "diyanet" | "ummalqura";

export type DayTimes = {
  imsak: string;
  gunes: string;
  ogle: string;
  ikindi: string;
  aksam: string;
  yatsi: string;
};

/* ------------------------------------------------------------------ */
/* Ayarlanabilir sabitler                                              */
/* ------------------------------------------------------------------ */
export const DIYANET = {
  fajrAngle: 18,
  ishaAngle: 17,
  ishaAngleHighLat: 16,
  highLatThreshold: 45,
  horizon: -0.8333,
  // dakika cinsinden temkin
  gunes: -7,
  ogle: 5,
  ikindi: 4,
  aksam: 7,
};

export const UMMALQURA = {
  fajrAngle: 18.5,
  horizon: -0.8333,
  ishaAfterMaghrib: 90,
  ishaAfterMaghribRamadan: 120,
};

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/* ------------------------------------------------------------------ */
/* Güneş konumu (NOAA)                                                 */
/* ------------------------------------------------------------------ */
function julianDay(y: number, m: number, d: number): number {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

function sunPosition(y: number, m: number, d: number, hourUtc: number): { dec: number; eot: number } {
  const jd = julianDay(y, m, d) + hourUtc / 24;
  const T = (jd - 2451545.0) / 36525;
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const Mr = rad(M);
  const C =
    Math.sin(Mr) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * Mr) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * Mr) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(rad(omega));
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(rad(omega));
  const dec = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda))));
  const yy = Math.tan(rad(eps / 2)) ** 2;
  const l0 = rad(L0);
  const eot =
    4 *
    deg(
      yy * Math.sin(2 * l0) -
        2 * e * Math.sin(Mr) +
        4 * e * yy * Math.sin(Mr) * Math.cos(2 * l0) -
        0.5 * yy * yy * Math.sin(4 * l0) -
        1.25 * e * e * Math.sin(2 * Mr),
    );
  return { dec, eot };
}

/* ------------------------------------------------------------------ */
/* Saat dilimi yardımcıları                                            */
/* ------------------------------------------------------------------ */
const dtfCache = new Map<string, Intl.DateTimeFormat>();
function dtf(tz: string): Intl.DateTimeFormat {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    dtfCache.set(tz, f);
  }
  return f;
}

/** Verilen UTC anında saat diliminin UTC'den farkı (dakika). */
export function tzOffsetMinutes(tz: string, utcMs: number): number {
  const parts = dtf(tz).formatToParts(new Date(utcMs));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / 60000);
}

function pad(n: number) {
  return n < 10 ? "0" + n : String(n);
}

/** UTC gün başlangıcından itibaren dakika → yerel "HH:MM". */
function toLocal(y: number, m: number, d: number, utcMinutes: number, tz: string): string {
  const utcMs = Date.UTC(y, m - 1, d) + Math.round(utcMinutes) * 60000;
  const off = tzOffsetMinutes(tz, utcMs);
  let total = Math.round(utcMinutes) + off;
  total = ((total % 1440) + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

/** Hicri (Ümmü'l-Kurâ takvimi) ay numarası (1..12). */
function hijriMonth(y: number, m: number, d: number): number {
  try {
    const f = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { timeZone: "UTC", month: "numeric" });
    const v = f.formatToParts(new Date(Date.UTC(y, m - 1, d, 12))).find((p) => p.type === "month")?.value;
    return Number(v) || 0;
  } catch {
    return 0;
  }
}

const HIJRI_MONTHS_TR = [
  "Muharrem",
  "Safer",
  "Rebiülevvel",
  "Rebiülahir",
  "Cemaziyelevvel",
  "Cemaziyelahir",
  "Recep",
  "Şaban",
  "Ramazan",
  "Şevval",
  "Zilkade",
  "Zilhicce",
];

/** "17 Cemaziyelevvel 1448" biçiminde hicri tarih (Ümmü'l-Kurâ takvimi). */
export function hijriDateTr(y: number, m: number, d: number): string {
  try {
    const f = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      timeZone: "UTC",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
    const parts = f.formatToParts(new Date(Date.UTC(y, m - 1, d, 12)));
    const g = (t: string) => Number(parts.find((p) => p.type === t)?.value);
    const mon = g("month");
    if (!mon || !g("day")) return "";
    return `${g("day")} ${HIJRI_MONTHS_TR[mon - 1]} ${g("year")}`;
  } catch {
    return "";
  }
}

/* ------------------------------------------------------------------ */
/* Ana hesap                                                           */
/* ------------------------------------------------------------------ */
export type ComputeOptions = {
  lat: number;
  lon: number;
  tz: string;
  method: Method;
};

/**
 * Yerel takvim günü (y, m, d) için vakitleri hesaplar.
 * Kutup gecesi/gündüzü gibi güneşin doğup batmadığı günlerde null döner.
 */
export function computeDay(y: number, m: number, d: number, opt: ComputeOptions): DayTimes | null {
  const { lat, lon, tz, method } = opt;

  let { dec, eot } = sunPosition(y, m, d, 12 - lon / 15);
  let noon = 720 - 4 * lon - eot;
  for (let i = 0; i < 2; i++) {
    ({ dec, eot } = sunPosition(y, m, d, noon / 60));
    noon = 720 - 4 * lon - eot;
  }

  const sinLat = Math.sin(rad(lat));
  const cosLat = Math.cos(rad(lat));
  const sinDec = Math.sin(rad(dec));
  const cosDec = Math.cos(rad(dec));

  /** Güneş yüksekliği alt (derece) için saat açısı (dakika), ulaşılamazsa null. */
  const ha = (alt: number): number | null => {
    const c = (Math.sin(rad(alt)) - sinLat * sinDec) / (cosLat * cosDec);
    if (c < -1 || c > 1) return null;
    return 4 * deg(Math.acos(c));
  };

  const cfgHorizon = method === "diyanet" ? DIYANET.horizon : UMMALQURA.horizon;
  const hRise = ha(cfgHorizon);
  if (hRise === null) return null;
  const rise = noon - hRise;
  const set = noon + hRise;

  const asrAlt = deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - dec))))));
  const hAsr = ha(asrAlt);
  const asr = hAsr === null ? noon + (set - noon) * 0.55 : noon + hAsr;

  // Gece uzunluğu (yedide bir kuralı için yedek)
  const night = 1440 - (set - rise);

  let fajr: number;
  let isha: number;

  if (method === "diyanet") {
    const fajrAngle = DIYANET.fajrAngle;
    const ishaAngle = Math.abs(lat) >= DIYANET.highLatThreshold ? DIYANET.ishaAngleHighLat : DIYANET.ishaAngle;
    const hF = ha(-fajrAngle);
    const hI = ha(-ishaAngle);
    fajr = hF === null ? rise - night / 7 : noon - hF;
    isha = hI === null ? set + night / 7 : noon + hI;
    // Diyanet temkin
    const rGunes = rise + DIYANET.gunes;
    const rOgle = noon + DIYANET.ogle;
    const rIkindi = asr + DIYANET.ikindi;
    const rAksam = set + DIYANET.aksam;
    return {
      imsak: toLocal(y, m, d, fajr, tz),
      gunes: toLocal(y, m, d, rGunes, tz),
      ogle: toLocal(y, m, d, rOgle, tz),
      ikindi: toLocal(y, m, d, rIkindi, tz),
      aksam: toLocal(y, m, d, rAksam, tz),
      yatsi: toLocal(y, m, d, isha, tz),
    };
  }

  // Ümmü'l-Kurâ
  const hF = ha(-UMMALQURA.fajrAngle);
  fajr = hF === null ? rise - night / 7 : noon - hF;
  const ramadan = hijriMonth(y, m, d) === 9;
  isha = set + (ramadan ? UMMALQURA.ishaAfterMaghribRamadan : UMMALQURA.ishaAfterMaghrib);
  return {
    imsak: toLocal(y, m, d, fajr, tz),
    gunes: toLocal(y, m, d, rise, tz),
    ogle: toLocal(y, m, d, noon, tz),
    ikindi: toLocal(y, m, d, asr, tz),
    aksam: toLocal(y, m, d, set, tz),
    yatsi: toLocal(y, m, d, isha, tz),
  };
}

/* ------------------------------------------------------------------ */
/* Kıble                                                               */
/* ------------------------------------------------------------------ */
const KAABA = { lat: 21.4225, lon: 39.8262 };

/** Kâbe'ye büyük daire yönü, kuzeyden saat yönünde derece (0-360). */
export function qiblaBearing(lat: number, lon: number): number {
  const p1 = rad(lat);
  const p2 = rad(KAABA.lat);
  const dl = rad(KAABA.lon - lon);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */
export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function computeMonth(y: number, m: number, opt: ComputeOptions): (DayTimes | null)[] {
  const n = daysInMonth(y, m);
  const out: (DayTimes | null)[] = [];
  for (let d = 1; d <= n; d++) out.push(computeDay(y, m, d, opt));
  return out;
}

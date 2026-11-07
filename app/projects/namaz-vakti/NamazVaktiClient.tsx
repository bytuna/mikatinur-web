"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CloudSun,
  Compass,
  Download,
  Loader2,
  MapPin,
  Moon,
  MoonStar,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import type { DayRow, InitialLists, MonthResponse, Option } from "@/lib/prayer/types";

const BASE = "/projects/namaz-vakti/api/v1";

type VakitKey = "imsak" | "gunes" | "ogle" | "ikindi" | "aksam" | "yatsi";

const VAKITS: { key: VakitKey; label: string; Icon: typeof Moon }[] = [
  { key: "imsak", label: "İmsak", Icon: Moon },
  { key: "gunes", label: "Güneş", Icon: Sunrise },
  { key: "ogle", label: "Öğle", Icon: Sun },
  { key: "ikindi", label: "İkindi", Icon: CloudSun },
  { key: "aksam", label: "Akşam", Icon: Sunset },
  { key: "yatsi", label: "Yatsı", Icon: MoonStar },
];

const COMPASS = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"];

/* ------------------------------ yardımcılar ------------------------------ */

function nowInZone(tz: string, ms: number): { date: string; secs: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(ms));
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return {
    date: `${g("year")}-${g("month")}-${g("day")}`,
    secs: Number(g("hour")) * 3600 + Number(g("minute")) * 60 + Number(g("second")),
  };
}

function toSecs(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(hm);
  return m ? Number(m[1]) * 3600 + Number(m[2]) * 60 : null;
}

function fmtCountdown(total: number): string {
  const t = Math.max(0, Math.floor(total));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

function monthTitle(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", month: "long", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, 15)),
  );
}

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function weekdayShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "short" }).format(
    new Date(Date.UTC(y, m - 1, d, 12)),
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as T;
}

/* --------------------------------- bileşen -------------------------------- */

type Props = {
  initial: MonthResponse | null;
  initialLists: InitialLists | null;
  defaultId: string;
};

export default function NamazVaktiClient({ initial, initialLists, defaultId }: Props) {
  const [months, setMonths] = useState<Record<string, MonthResponse>>(() =>
    initial ? { [`${initial.place.id}|${initial.month}`]: initial } : {},
  );
  const [placeId, setPlaceId] = useState<string>(initial ? initial.place.id : defaultId);
  const [viewMonth, setViewMonth] = useState<string>(initial ? initial.month : "");
  const [placeInfo, setPlaceInfo] = useState(initial ? initial.place : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [countries, setCountries] = useState<Option[]>(initialLists?.countries ?? []);
  const [regions, setRegions] = useState<Option[]>(initialLists?.regions ?? []);
  const [districts, setDistricts] = useState<Option[]>(initialLists?.districts ?? []);
  const [countryId, setCountryId] = useState(initialLists?.countryId ?? "");
  const [regionId, setRegionId] = useState(initialLists?.regionId ?? "");
  const [districtId, setDistrictId] = useState(initialLists?.districtId ?? "");
  const [listBusy, setListBusy] = useState(false);

  const [now, setNow] = useState<number | null>(null);
  const reqRef = useRef(0);
  const inflight = useRef(new Set<string>());

  /* saat */
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* ilk yükleme başarısız olduysa */
  useEffect(() => {
    if (!initial) void loadPlace(defaultId);
    if (countries.length === 0) {
      fetchJson<{ items: Option[] }>(`${BASE}/places/?type=countries`)
        .then((r) => setCountries(r.items))
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const storeMonth = useCallback((data: MonthResponse) => {
    setMonths((prev) => ({ ...prev, [`${data.place.id}|${data.month}`]: data }));
  }, []);

  /** Bir yerin bu ayki verisini yükler ve görünümü ona çevirir. */
  async function loadPlace(id: string) {
    const token = ++reqRef.current;
    setLoading(true);
    setError("");
    try {
      const data = await fetchJson<MonthResponse>(`${BASE}/times/?id=${encodeURIComponent(id)}`);
      if (token !== reqRef.current) return;
      storeMonth(data);
      setPlaceId(data.place.id);
      setPlaceInfo(data.place);
      setViewMonth(data.month);
    } catch {
      if (token === reqRef.current) setError("Vakitler şu an alınamadı. Lütfen tekrar deneyin.");
    } finally {
      if (token === reqRef.current) setLoading(false);
    }
  }

  const ensureMonth = useCallback(
    async (id: string, ym: string) => {
      const key = `${id}|${ym}`;
      if (inflight.current.has(key)) return;
      inflight.current.add(key);
      try {
        const data = await fetchJson<MonthResponse>(`${BASE}/times/?id=${encodeURIComponent(id)}&month=${ym}`);
        storeMonth(data);
      } catch {
        /* sessizce geç */
      } finally {
        inflight.current.delete(key);
      }
    },
    [storeMonth],
  );

  const tz = placeInfo?.tz ?? "Europe/Istanbul";
  const zoned = useMemo(() => (now === null ? null : nowInZone(tz, now)), [now, tz]);
  const todayIso = zoned?.date ?? months[`${placeId}|${viewMonth}`]?.today ?? "";
  const todayYm = todayIso.slice(0, 7);

  /* bugünün ayı elimizde yoksa (ay dönümü) getir */
  useEffect(() => {
    if (placeId && todayYm && !months[`${placeId}|${todayYm}`]) void ensureMonth(placeId, todayYm);
  }, [placeId, todayYm, months, ensureMonth]);

  /* görüntülenen ay elimizde yoksa getir */
  useEffect(() => {
    if (placeId && viewMonth && !months[`${placeId}|${viewMonth}`]) void ensureMonth(placeId, viewMonth);
  }, [placeId, viewMonth, months, ensureMonth]);

  const todayMonthData = months[`${placeId}|${todayYm}`];
  const todayRow: DayRow | undefined = todayMonthData?.days.find((d) => d.date === todayIso);
  const tomorrowRow: DayRow | undefined = useMemo(() => {
    if (!todayMonthData || !todayRow) return undefined;
    const i = todayMonthData.days.indexOf(todayRow);
    return i >= 0 && i + 1 < todayMonthData.days.length ? todayMonthData.days[i + 1] : (todayMonthData.after ?? undefined);
  }, [todayMonthData, todayRow]);

  /* şu anki / sıradaki vakit */
  const status = useMemo(() => {
    if (!zoned || !todayRow) return null;
    const secs = VAKITS.map((v) => toSecs(todayRow[v.key]));
    if (secs.some((s) => s === null)) return null;
    const t = secs as number[];
    const n = zoned.secs;
    let cur = -1;
    for (let i = 0; i < t.length; i++) if (t[i] <= n) cur = i;
    if (cur === t.length - 1) {
      const tm = tomorrowRow ? toSecs(tomorrowRow.imsak) : null;
      if (tm === null) return { current: cur, next: 0, remaining: null as number | null };
      return { current: cur, next: 0, remaining: tm + 86400 - n };
    }
    const next = cur + 1;
    return { current: cur, next, remaining: t[next] - n };
  }, [zoned, todayRow, tomorrowRow]);

  /* seçiciler */
  async function onCountry(id: string) {
    setCountryId(id);
    setRegionId("");
    setDistrictId("");
    setRegions([]);
    setDistricts([]);
    if (!id) return;
    setListBusy(true);
    try {
      const r = await fetchJson<{ items: Option[] }>(`${BASE}/places/?type=regions&country=${id}`);
      setRegions(r.items);
      if (r.items.length === 1) void onRegion(r.items[0].id);
    } catch {
      setError("Liste alınamadı.");
    } finally {
      setListBusy(false);
    }
  }

  async function onRegion(id: string) {
    setRegionId(id);
    setDistrictId("");
    setDistricts([]);
    if (!id) return;
    setListBusy(true);
    try {
      const r = await fetchJson<{ items: Option[] }>(`${BASE}/places/?type=districts&region=${id}`);
      setDistricts(r.items);
      if (r.items.length === 1) onDistrict(r.items[0].id);
    } catch {
      setError("Liste alınamadı.");
    } finally {
      setListBusy(false);
    }
  }

  function onDistrict(id: string) {
    setDistrictId(id);
    if (id) void loadPlace(id);
  }

  const viewData = months[`${placeId}|${viewMonth}`];
  const qibla = placeInfo?.qibla ?? 0;
  const qiblaText = `${Math.round(qibla)}° ${COMPASS[Math.round(qibla / 45) % 8]}`;
  const calculated = todayRow?.source === "hesaplama";

  const selectCls =
    "w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-gray-100 outline-none transition focus:border-emerald-400/60 focus:bg-white/[0.07] disabled:opacity-40";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-gray-100">
      {/* arka plan ışıkları */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[46rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[40rem] -right-40 h-[24rem] w-[24rem] rounded-full bg-amber-400/5 blur-[110px]" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6">
        {/* ÜST BÖLÜM: sayfanın ortasında, hafif yukarıda */}
        <section className="flex min-h-[88vh] flex-col justify-center gap-6 pb-14 pt-10 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-gray-300">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              {placeInfo ? (
                <span>
                  {placeInfo.name}
                  {placeInfo.city && placeInfo.city !== placeInfo.name ? `, ${placeInfo.city}` : ""} · {placeInfo.country}
                </span>
              ) : (
                <span>Yükleniyor…</span>
              )}
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              {status ? VAKITS[status.next].label : "Namaz Vakitleri"}
              {status && <span className="text-gray-500"> vaktine</span>}
            </h1>

            <div className="mt-2 font-mono text-5xl font-light tabular-nums tracking-tight text-emerald-300 sm:text-6xl">
              {status && status.remaining !== null ? fmtCountdown(status.remaining) : "--:--:--"}
            </div>

            <p className="mt-3 text-sm text-gray-400">
              {todayIso ? longDate(todayIso) : ""}
              {todayRow?.hicri ? <span className="text-gray-500"> · {todayRow.hicri}</span> : null}
            </p>
          </motion.div>

          {/* vakit kartları */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {VAKITS.map(({ key, label, Icon }, i) => {
              const isCurrent = status?.current === i;
              const isNext = status?.next === i;
              return (
                <div
                  key={key}
                  className={[
                    "relative rounded-2xl border p-4 text-center transition-colors",
                    isCurrent
                      ? "border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_30px_-10px_rgba(52,211,153,0.5)]"
                      : isNext
                        ? "border-amber-300/30 bg-amber-300/[0.06]"
                        : "border-white/10 bg-white/[0.03]",
                  ].join(" ")}
                >
                  <Icon
                    className={`mx-auto h-5 w-5 ${isCurrent ? "text-emerald-300" : isNext ? "text-amber-300" : "text-gray-500"}`}
                  />
                  <div className="mt-2 text-xs uppercase tracking-wider text-gray-400">{label}</div>
                  <div className="mt-1 font-mono text-2xl font-medium tabular-nums text-white">
                    {todayRow ? todayRow[key] : "--:--"}
                  </div>
                  {isCurrent && <div className="mt-1 text-[10px] font-medium text-emerald-300">ŞU AN</div>}
                  {isNext && !isCurrent && <div className="mt-1 text-[10px] font-medium text-amber-300">SIRADAKİ</div>}
                </div>
              );
            })}
          </motion.div>

          {/* ülke / il / ilçe seçimi */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">Ülke</span>
                <select className={selectCls} value={countryId} onChange={(e) => void onCountry(e.target.value)}>
                  <option value="" className="bg-neutral-900">
                    Ülke seçin
                  </option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id} className="bg-neutral-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">İl / Şehir</span>
                <select
                  className={selectCls}
                  value={regionId}
                  disabled={!countryId || listBusy}
                  onChange={(e) => void onRegion(e.target.value)}
                >
                  <option value="" className="bg-neutral-900">
                    İl seçin
                  </option>
                  {regions.map((c) => (
                    <option key={c.id} value={c.id} className="bg-neutral-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-gray-500">İlçe</span>
                <select
                  className={selectCls}
                  value={districtId}
                  disabled={!regionId || listBusy}
                  onChange={(e) => onDistrict(e.target.value)}
                >
                  <option value="" className="bg-neutral-900">
                    İlçe seçin
                  </option>
                  {districts.map((c) => (
                    <option key={c.id} value={c.id} className="bg-neutral-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-3 flex min-h-5 items-center justify-between gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                {(loading || listBusy) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {error ? <span className="text-red-400">{error}</span> : null}
              </span>
              <span>
                {placeInfo?.method === "ummalqura"
                  ? "Yöntem: Ümmü'l-Kurâ (hesaplanmıştır)"
                  : calculated
                    ? "Yöntem: Diyanet kuralıyla hesaplanmıştır"
                    : "Kaynak: Diyanet İşleri Başkanlığı"}
              </span>
            </div>
          </motion.div>
        </section>

        {/* KIBLE + İNDİR */}
        <section className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-2">
          <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="relative h-24 w-24 shrink-0 rounded-full border border-white/15 bg-black/30">
              <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[10px] text-gray-500">K</span>
              <div
                className="absolute inset-0 flex items-center justify-center transition-transform duration-700"
                style={{ transform: `rotate(${qibla}deg)` }}
              >
                <div className="h-[72%] w-0.5 rounded bg-gradient-to-t from-transparent via-emerald-500/30 to-emerald-300" />
              </div>
              <Compass className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-gray-500">Kıble yönü</div>
              <div className="mt-1 text-2xl font-semibold text-white">{placeInfo ? qiblaText : "—"}</div>
              <div className="mt-1 text-xs text-gray-500">Kuzeyden saat yönünde, Kâbe'ye en kısa yol</div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-transparent p-5">
            <div>
              <div className="text-sm font-medium text-white">Mikat-ı Nur uygulaması</div>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                Ezan bildirimleri ve vakitler cebinizde. Android uygulamasını indirin.
              </p>
            </div>
            <Link
              href="/download"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              <Download className="h-4 w-4" />
              Uygulamayı İndir
            </Link>
          </div>
        </section>

        {/* AYLIK TABLO */}
        <section className="pb-20">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Aylık Vakitler</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Önceki ay"
                disabled={!viewMonth}
                onClick={() => setViewMonth((m) => shiftMonth(m, -1))}
                className="rounded-lg border border-white/10 p-2 text-gray-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="min-w-36 text-center text-sm capitalize text-gray-200">
                {viewMonth ? monthTitle(viewMonth) : "—"}
              </div>
              <button
                type="button"
                aria-label="Sonraki ay"
                disabled={!viewMonth}
                onClick={() => setViewMonth((m) => shiftMonth(m, 1))}
                className="rounded-lg border border-white/10 p-2 text-gray-300 transition hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-3 text-left font-medium">Gün</th>
                  {VAKITS.map((v) => (
                    <th key={v.key} className="px-2 py-3 text-center font-medium">
                      {v.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {viewData ? (
                  viewData.days.map((d) => {
                    const isToday = d.date === todayIso;
                    return (
                      <tr
                        key={d.date}
                        className={[
                          "border-b border-white/5 last:border-0",
                          isToday ? "bg-emerald-400/10 text-white" : "text-gray-300 hover:bg-white/[0.03]",
                        ].join(" ")}
                      >
                        <td className="whitespace-nowrap px-3 py-2 text-left">
                          <span className="font-medium">{Number(d.date.slice(8))}</span>{" "}
                          <span className="text-xs text-gray-500">{weekdayShort(d.date)}</span>
                          {d.source === "hesaplama" && (
                            <span title="Hesaplanmıştır" className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-300/80" />
                          )}
                        </td>
                        {VAKITS.map((v) => (
                          <td key={v.key} className="px-2 py-2 text-center font-mono tabular-nums">
                            {d[v.key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-gray-500">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-amber-300/80" />
            işaretli günler Diyanet kuralıyla hesaplanmıştır; diğerleri Diyanet İşleri Başkanlığı verisidir. Vakitler
            bilgilendirme amaçlıdır.
          </p>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Moon,
  MoonStar,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import type { InitialLists, Option } from "@/lib/prayer/types";
import type { RamadanSchedule, ReligiousDay } from "@/lib/prayer/religious-days";

const API_BASE = "/projects/namaz-vakti/api/v1";

type Props = {
  initialDays: ReligiousDay[];
  initialSource: "diyanet-live" | "diyanet-official";
  initialRamadan: RamadanSchedule | null;
  initialLists: InitialLists | null;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as T;
}

function getTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)?.value ?? "01";
  return `${g("year")}-${g("month")}-${g("day")}`;
}

function diffDays(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = fromIso.split("-").map(Number);
  const [y2, m2, d2] = toIso.split("-").map(Number);
  const t1 = Date.UTC(y1, m1 - 1, d1);
  const t2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((t2 - t1) / 86400000);
}

const CATEGORY_BADGES: Record<
  ReligiousDay["category"],
  { label: string; cls: string }
> = {
  kandil: {
    label: "Mübarek Kandil",
    cls: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  ramazan: {
    label: "Ramazan-ı Şerif",
    cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  bayram: {
    label: "Dini Bayram",
    cls: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  },
  ozel: {
    label: "Mübarek Gün",
    cls: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  },
};

export default function DiniGunlerClient({
  initialDays,
  initialSource,
  initialRamadan,
  initialLists,
}: Props) {
  const [activeTab, setActiveTab] = useState<"gunler" | "imsakiye">("gunler");
  const [selectedYear, setSelectedYear] = useState<"all" | "2026" | "2027">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | ReligiousDay["category"]>("all");
  const [todayIso, setTodayIso] = useState<string>("2026-11-14");

  const [ramadanYear, setRamadanYear] = useState<2026 | 2027>(() => {
    const today = getTodayIso();
    return today > "2026-03-22" ? 2027 : 2026;
  });
  const [ramadanData, setRamadanData] = useState<RamadanSchedule | null>(initialRamadan);
  const [ramadanLoading, setRamadanLoading] = useState(false);

  const [countries] = useState<Option[]>(initialLists?.countries ?? []);
  const [regions, setRegions] = useState<Option[]>(initialLists?.regions ?? []);
  const [districts, setDistricts] = useState<Option[]>(initialLists?.districts ?? []);
  const [countryId, setCountryId] = useState(initialLists?.countryId ?? "");
  const [regionId, setRegionId] = useState(initialLists?.regionId ?? "");
  const [districtId, setDistrictId] = useState(initialLists?.districtId ?? (initialRamadan?.place.id ?? "9545"));
  const [listBusy, setListBusy] = useState(false);

  useEffect(() => {
    setTodayIso(getTodayIso());
  }, []);

  // Sıradaki dini günler (aynı tarihte birden fazla olabilir: örn. Üç Ayların Başlangıcı ve Regaip Kandili)
  const upcomingInfo = useMemo(() => {
    const future = initialDays.filter((d) => d.isoDate >= todayIso);
    if (future.length === 0) return null;
    const nextDate = future[0].isoDate;
    const sameDateEvents = future.filter((d) => d.isoDate === nextDate);
    const remainingDays = diffDays(todayIso, nextDate);
    return {
      nextDate,
      events: sameDateEvents,
      remainingDays,
    };
  }, [initialDays, todayIso]);

  const filteredDays = useMemo(() => {
    return initialDays.filter((d) => {
      if (selectedYear !== "all" && !d.isoDate.startsWith(selectedYear)) return false;
      if (categoryFilter !== "all" && d.category !== categoryFilter) return false;
      return true;
    });
  }, [initialDays, selectedYear, categoryFilter]);

  async function loadRamadan(placeId: string, year: 2026 | 2027) {
    setRamadanLoading(true);
    try {
      const res = await fetchJson<{ ramadan: RamadanSchedule | null }>(
        `${API_BASE}/dini-gunler/?placeId=${encodeURIComponent(placeId)}&ramadanYear=${year}`,
      );
      if (res.ramadan) setRamadanData(res.ramadan);
    } catch {
      /* sessizce geç */
    } finally {
      setRamadanLoading(false);
    }
  }

  async function onCountryChange(id: string) {
    setCountryId(id);
    setRegionId("");
    setDistrictId("");
    setRegions([]);
    setDistricts([]);
    if (!id) return;
    setListBusy(true);
    try {
      const r = await fetchJson<{ items: Option[] }>(`${API_BASE}/places/?type=regions&country=${id}`);
      setRegions(r.items);
      if (r.items.length === 1) void onRegionChange(r.items[0].id);
    } finally {
      setListBusy(false);
    }
  }

  async function onRegionChange(id: string) {
    setRegionId(id);
    setDistrictId("");
    setDistricts([]);
    if (!id) return;
    setListBusy(true);
    try {
      const r = await fetchJson<{ items: Option[] }>(`${API_BASE}/places/?type=districts&region=${id}`);
      setDistricts(r.items);
      if (r.items.length === 1) onDistrictChange(r.items[0].id);
    } finally {
      setListBusy(false);
    }
  }

  function onDistrictChange(id: string) {
    setDistrictId(id);
    if (id) void loadRamadan(id, ramadanYear);
  }

  function onRamadanYearChange(year: 2026 | 2027) {
    setRamadanYear(year);
    void loadRamadan(districtId || "9545", year);
  }

  const selectCls =
    "w-full appearance-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-900 dark:text-gray-100 outline-none transition focus:border-emerald-500/60 dark:focus:border-emerald-400/60";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 pb-20 transition-colors duration-300">
      {/* Arka Plan Nur Işıkları */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-36 left-1/2 h-[26rem] w-[44rem] -translate-x-1/2 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[28rem] -right-32 h-[22rem] w-[22rem] rounded-full bg-amber-400/15 dark:bg-amber-400/10 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-8 sm:pt-12">
        {/* Üst Navigasyon ve Başlık */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pr-28 sm:pr-32">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya (Namaz Vakitlerine) Dön
          </Link>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            {initialSource === "diyanet-live"
              ? "Diyanet İşleri Başkanlığı Canlı Verisi"
              : "Diyanet İşleri Başkanlığı Resmi Takvimi"}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Dini Günler & Ramazan İmsakiyesi
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-gray-400">
            Diyanet İşleri Başkanlığı verileriyle mübarek gün ve geceler takvimi, kalan süre sayacı ve resmi Ramazan-ı Şerif imsakiyesi.
          </p>
        </div>

        {/* SIRADAKİ DİNİ GÜN ÖZEL VURGU KARTI (HERO) */}
        {upcomingInfo && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative mb-10 overflow-hidden rounded-3xl border border-emerald-500/40 dark:border-emerald-400/40 bg-gradient-to-br from-emerald-500/15 via-white to-amber-500/10 dark:from-emerald-950/50 dark:via-gray-900/80 dark:to-amber-950/30 p-6 sm:p-8 shadow-[0_12px_40px_-15px_rgba(16,185,129,0.28)]"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600 dark:bg-emerald-500 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  Sıradaki Mübarek Gün / Gece
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {upcomingInfo.events.map((e) => e.name).join(" & ")}
                </h2>

                <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed">
                  {upcomingInfo.events[0].description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] px-3 py-1.5">
                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    {upcomingInfo.events[0].formattedDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-800 dark:text-amber-300">
                    <Moon className="h-4 w-4" />
                    Hicri: {upcomingInfo.events[0].hijriDate}
                  </span>
                </div>
              </div>

              {/* Kalan Gün Sayacı Kutusu */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 dark:border-emerald-400/30 bg-white/90 dark:bg-black/40 px-7 py-5 text-center shadow-sm shrink-0">
                <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                {upcomingInfo.remainingDays === 0 ? (
                  <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    BUGÜN
                  </div>
                ) : (
                  <>
                    <div className="font-mono text-4xl sm:text-5xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                      {upcomingInfo.remainingDays}
                    </div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
                      Gün Kaldı
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* ANA SEKME SEÇİCİ: DİNİ GÜNLER TAKVİMİ vs RAMAZAN İMSAKİYESİ */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="inline-flex rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-gray-900/60 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("gunler")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "gunler"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Dini Günler Takvimi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("imsakiye")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "imsakiye"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MoonStar className="h-4 w-4" />
              Resmi Ramazan İmsakiyesi
            </button>
          </div>

          {activeTab === "gunler" && (
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "2026", "2027"] as const).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    selectedYear === yr
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-gray-400"
                  }`}
                >
                  {yr === "all" ? "2026 – 2027 Tümü" : `${yr} Yılı`}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === "gunler" ? (
          /* ==============================================================
             SEKME 1: DİNİ GÜNLER VE GECELER LİSTESİ
             ============================================================== */
          <section className="space-y-6">
            {/* Kategori Filtreleri */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: "Tümü" },
                { id: "kandil", label: "Kandil Geceleri" },
                { id: "ramazan", label: "Ramazan & Arefe" },
                { id: "bayram", label: "Bayramlar" },
                { id: "ozel", label: "Hicri Yılbaşı & Aşure" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id as typeof categoryFilter)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                    categoryFilter === cat.id
                      ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black"
                      : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-slate-600 dark:text-gray-400 hover:border-slate-300"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Gün Kartları */}
            <div className="grid grid-cols-1 gap-3.5">
              {filteredDays.map((day) => {
                const delta = diffDays(todayIso, day.isoDate);
                const isPast = delta < 0;
                const isNext = upcomingInfo?.nextDate === day.isoDate;
                const badge = CATEGORY_BADGES[day.category];

                return (
                  <div
                    key={day.id}
                    className={[
                      "group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition-all",
                      isNext
                        ? "border-emerald-500/70 dark:border-emerald-400/60 bg-emerald-500/[0.08] dark:bg-emerald-400/[0.08] shadow-[0_0_25px_-8px_rgba(16,185,129,0.4)]"
                        : isPast
                          ? "border-slate-200/70 dark:border-white/5 bg-slate-100/60 dark:bg-white/[0.015] opacity-65"
                          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-emerald-400/50 shadow-2xs dark:shadow-none",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-4">
                      {/* Sol Tarih Rozeti */}
                      <div
                        className={[
                          "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border text-center font-mono",
                          isNext
                            ? "border-emerald-500/50 bg-emerald-600 text-white"
                            : isPast
                              ? "border-slate-200 dark:border-white/10 bg-slate-200/60 dark:bg-white/5 text-slate-500 dark:text-gray-500"
                              : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white",
                        ].join(" ")}
                      >
                        <span className="text-lg font-black leading-none">
                          {day.shortDate.slice(0, 2)}
                        </span>
                        <span className="mt-0.5 text-[10px] font-sans uppercase opacity-80">
                          {day.shortDate.slice(3, 5)}.{day.shortDate.slice(8, 10)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                            {day.name}
                          </h3>
                          <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                            {badge.label}
                          </span>
                          {isNext && (
                            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                              SIRADAKİ
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                          {day.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500 dark:text-gray-400">
                          <span className="font-medium text-slate-700 dark:text-gray-300">
                            {day.formattedDate}
                          </span>
                          <span>•</span>
                          <span className="text-amber-700 dark:text-amber-300 font-medium">
                            {day.hijriDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sağ Durum Göstergesi */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 border-slate-200/60 dark:border-white/5 pt-2 sm:pt-0">
                      {isPast ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-gray-500">
                          <CheckCircle2 className="h-4 w-4" />
                          Geçti
                        </span>
                      ) : delta === 0 ? (
                        <span className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">
                          Bugün
                        </span>
                      ) : (
                        <div className="text-right">
                          <span
                            className={`font-mono text-lg sm:text-xl font-bold tabular-nums ${
                              isNext ? "text-emerald-600 dark:text-emerald-400" : "text-slate-800 dark:text-gray-200"
                            }`}
                          >
                            {delta} gün
                          </span>
                          <span className="block text-[11px] text-slate-500 dark:text-gray-500">
                            sonra
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          /* ==============================================================
             SEKME 2: DİYANET RESMİ RAMAZAN İMSAKİYESİ
             ============================================================== */
          <section className="space-y-6">
            {/* Ramazan Yılı ve İl/İlçe Seçim Kartı */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 sm:p-6 shadow-2xs dark:shadow-none space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {ramadanData?.place
                      ? `${ramadanData.place.name}, ${ramadanData.place.city} · ${ramadanData.place.country}`
                      : "Konum Seçin"}
                  </div>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {ramadanData?.title ?? "Resmi Ramazan İmsakiyesi"}
                  </h2>
                </div>

                {/* 2026 / 2027 Ramazan Seçici */}
                <div className="inline-flex rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black/40 p-1 self-start">
                  {([2027, 2026] as const).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => onRamadanYearChange(yr)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        ramadanYear === yr
                          ? "bg-emerald-600 text-white"
                          : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {yr === 2027 ? "2027 (1448 Yaklaşan)" : "2026 (1447)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ülke / İl / İlçe Seçicileri */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500 dark:text-gray-400">Ülke</span>
                  <select className={selectCls} value={countryId} onChange={(e) => void onCountryChange(e.target.value)}>
                    <option value="" className="bg-white dark:bg-neutral-900">Ülke seçin</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-neutral-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500 dark:text-gray-400">İl / Şehir</span>
                  <select
                    className={selectCls}
                    value={regionId}
                    disabled={!countryId || listBusy}
                    onChange={(e) => void onRegionChange(e.target.value)}
                  >
                    <option value="" className="bg-white dark:bg-neutral-900">İl seçin</option>
                    {regions.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-neutral-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs text-slate-500 dark:text-gray-400">İlçe</span>
                  <select
                    className={selectCls}
                    value={districtId}
                    disabled={!regionId || listBusy}
                    onChange={(e) => onDistrictChange(e.target.value)}
                  >
                    <option value="" className="bg-white dark:bg-neutral-900">İlçe seçin</option>
                    {districts.map((c) => (
                      <option key={c.id} value={c.id} className="bg-white dark:bg-neutral-900">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Kadir Gecesi ve Bayram Özeti */}
              {ramadanData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      İlk Sahur / 1. Gün
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {ramadanData.days[0]?.formattedDate} — İmsak: {ramadanData.days[0]?.imsak}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Kadir Gecesi (27. Gece)
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {ramadanData.days.find((d) => d.isKadirGecesi)?.formattedDate ?? "26 Ramazan"}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/5 p-3.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                      Ramazan Bayramı 1. Gün
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                      {ramadanData.bayramFirstDay}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 29/30 Günlük Ramazan İmsakiyesi Tablosu */}
            <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-2xs dark:shadow-none">
              {ramadanLoading ? (
                <div className="flex items-center justify-center py-20 text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Ramazan İmsakiyesi yükleniyor...
                </div>
              ) : ramadanData ? (
                <table className="w-full min-w-[44rem] text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      <th className="px-3.5 py-3.5 text-left font-semibold">Ramazan</th>
                      <th className="px-3.5 py-3.5 text-left font-semibold">Miladi Tarih</th>
                      <th className="px-2.5 py-3.5 text-center font-bold text-emerald-700 dark:text-emerald-300">
                        <span className="inline-flex items-center gap-1"><Moon className="h-3.5 w-3.5" /> İmsak (Sahur)</span>
                      </th>
                      <th className="px-2.5 py-3.5 text-center font-medium">
                        <span className="inline-flex items-center gap-1"><Sunrise className="h-3.5 w-3.5" /> Güneş</span>
                      </th>
                      <th className="px-2.5 py-3.5 text-center font-medium">
                        <span className="inline-flex items-center gap-1"><Sun className="h-3.5 w-3.5" /> Öğle</span>
                      </th>
                      <th className="px-2.5 py-3.5 text-center font-medium">İkindi</th>
                      <th className="px-2.5 py-3.5 text-center font-bold text-amber-700 dark:text-amber-300">
                        <span className="inline-flex items-center gap-1"><Sunset className="h-3.5 w-3.5" /> Akşam (İftar)</span>
                      </th>
                      <th className="px-2.5 py-3.5 text-center font-medium">
                        <span className="inline-flex items-center gap-1"><MoonStar className="h-3.5 w-3.5" /> Yatsı (Teravih)</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ramadanData.days.map((row) => (
                      <tr
                        key={row.isoDate}
                        className={[
                          "border-b border-slate-100 dark:border-white/5 last:border-0 transition-colors",
                          row.isKadirGecesi
                            ? "bg-amber-500/15 dark:bg-amber-400/15 font-semibold"
                            : row.isArefe
                              ? "bg-indigo-500/10 dark:bg-indigo-400/10"
                              : "hover:bg-slate-50 dark:hover:bg-white/[0.03]",
                        ].join(" ")}
                      >
                        <td className="whitespace-nowrap px-3.5 py-3 text-left">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {row.ramadanDay}. Gün
                          </span>
                          {row.isKadirGecesi && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black">
                              <Star className="h-2.5 w-2.5 fill-current" /> Kadir Gecesi
                            </span>
                          )}
                          {row.isArefe && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                              Arefe
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3.5 py-3 text-left text-slate-700 dark:text-gray-300">
                          {row.formattedDate}
                        </td>
                        <td className="px-2.5 py-3 text-center font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-300 bg-emerald-500/[0.04]">
                          {row.imsak}
                        </td>
                        <td className="px-2.5 py-3 text-center font-mono tabular-nums text-slate-600 dark:text-gray-400">
                          {row.gunes}
                        </td>
                        <td className="px-2.5 py-3 text-center font-mono tabular-nums text-slate-700 dark:text-gray-300">
                          {row.ogle}
                        </td>
                        <td className="px-2.5 py-3 text-center font-mono tabular-nums text-slate-700 dark:text-gray-300">
                          {row.ikindi}
                        </td>
                        <td className="px-2.5 py-3 text-center font-mono font-bold tabular-nums text-amber-700 dark:text-amber-300 bg-amber-500/[0.05]">
                          {row.aksam}
                        </td>
                        <td className="px-2.5 py-3 text-center font-mono tabular-nums text-slate-700 dark:text-gray-300">
                          {row.yatsi}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

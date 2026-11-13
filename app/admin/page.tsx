"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bug,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  RefreshCw,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AdminAnalyticsDashboard } from "../../components/AdminAnalyticsDashboard";

type AdminStatsResponse = {
  totalVisits: number;
  uniqueVisitors: number;
  mostVisitedPage: { path: string; visits: number };
  messages: Array<{
    name?: string;
    email?: string;
    category?: string;
    message?: string;
    _date?: string;
  }>;
  messageCount: number;
  formspreeConfigured: boolean;
  bugReports: Array<{
    id: string;
    createdAt: string;
    bookTitle: string;
    pageNumber: number;
    description: string;
    reporterEmail?: string;
    url?: string;
  }>;
  bugReportCount: number;
};

const SYSTEM_MODULES = [
  {
    title: "Ana Sayfa & Canlı Vakit Motoru",
    path: "/",
    type: "Web Sayfası",
    desc: "Ülke/İl/İlçe bazlı canlı namaz vakitleri, Kıble pusulası ve aylık imsakiye tablosu.",
    icon: Clock,
  },
  {
    title: "Dini Günler & Resmi Ramazan İmsakiyesi",
    path: "/projects/dini-gunler",
    type: "Web & Diyanet Servisi",
    desc: "2026/2027 Diyanet dini günler takvimi, geri sayım ve 29/30 günlük Ramazan İmsakiyesi.",
    icon: Calendar,
  },
  {
    title: "Risale-i Nur Web Mütalaa Stüdyosu",
    path: "/projects/risaleinur",
    type: "Okuyucu & AI",
    desc: "15 cilt külliyat, Osmanlıca lügat, Kur'ân meali ve Gemini AI Tefekkür Asistanı.",
    icon: BookOpen,
  },
  {
    title: "Mîkāt-ı Nur Tanıtım Vitrini",
    path: "/projects/mikatinur",
    type: "Web Sayfası",
    desc: "Android mobil uygulaması ve Web platformunun birleşik tanıtım sayfası.",
    icon: Compass,
  },
  {
    title: "Resmi APK İndirme Merkezi (v1.1.7)",
    path: "/download",
    type: "Dağıtım & Karekod",
    desc: "Mikat-Nur-v1.1.7.apk doğrudan indirme, karekod (QR) ve sürüm geçmişi.",
    icon: Download,
  },
  {
    title: "Android Vakit Uyumluluk API'si",
    path: "/projects/namaz-vakti/api/v1/compat/vakitler?ilce=9545",
    type: "REST API (JSON)",
    desc: "Mîkāt-ı Nur Android uygulamasının vakit çekmek için kullandığı canlı uç nokta.",
    icon: Server,
  },
];

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loggingIn, setLoggingIn] = useState(false);
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "inbox" | "system">("analytics");

  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetch("/api/admin/auth", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.authenticated) {
          setAuth(true);
        }
      })
      .catch(() => {
        // ignore
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, []);

  const fetchStats = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (res.status === 401) {
        setAuth(false);
        return;
      }
      const json = (await res.json()) as AdminStatsResponse;
      setData(json);
    } catch {
      setData({
        totalVisits: 0,
        uniqueVisitors: 0,
        mostVisitedPage: { path: "/", visits: 0 },
        messages: [],
        messageCount: 0,
        formspreeConfigured: false,
        bugReports: [],
        bugReportCount: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (auth) {
      fetchStats(false);
    }
  }, [auth, fetchStats]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });

      if (res.ok) {
        setPass("");
        setAuth(true);
      } else {
        const err = await res.json().catch(() => null);
        setAuthError(
          err?.error || "Girdiğiniz yönetici şifresi hatalı. Lütfen kontrol edip tekrar deneyin."
        );
      }
    } catch {
      setAuthError("Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // ignore
    }
    setAuth(false);
    setPass("");
  }

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] flex items-center justify-center p-6 transition-colors duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </main>
    );
  }

  /* ==========================================================
     1. YÖNETİCİ GİRİŞ EKRANI (LOGIN)
     ========================================================== */
  if (!auth) {
    return (
      <main className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-gray-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300">
        {/* Arka Plan Işık Dokusu */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute -top-36 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-rose-500/10 via-purple-500/8 to-blue-500/10 blur-3xl" />
        </div>

        {/* Üst Geri Dönüş Barı */}
        <div className="relative z-10 mx-auto w-full max-w-5xl pt-2 flex items-center justify-between pr-24 sm:pr-28">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Ana Sayfaya Dön
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-[11px] font-medium text-rose-700 dark:text-rose-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Yetkili Erişim Alanı
          </span>
        </div>

        {/* Merkez Giriş Kartı */}
        <div className="relative z-10 my-auto mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-7 sm:p-9 shadow-xl dark:shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-500/15 via-purple-500/10 to-blue-500/10 text-rose-600 dark:text-rose-400 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>

            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
                Mîkāt-ı Nur
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Yönetim Merkezi
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Site analitiği, okuyucu bildirimleri ve sistem durumunu görüntülemek için yönetici şifrenizi girin.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400 mb-2"
                >
                  Yönetici Şifresi
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
                  <input
                    id="admin-password"
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => {
                      setPass(e.target.value);
                      if (authError) setAuthError(null);
                    }}
                    placeholder="••••••••••••"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 pl-10 pr-11 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-black/70 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-3.5 px-5 font-bold text-sm shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Yönetim Paneline Giriş Yap</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Mîkāt-ı Nur Ana Sayfasına Dön
              </Link>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-center text-[11px] text-slate-400 dark:text-gray-600 pb-2">
          Mîkāt-ı Nur Yönetim ve Analitik Sistemi • İlker Tuna (ByTuna)
        </p>
      </main>
    );
  }

  /* ==========================================================
     2. YÖNETİM PANELİ ANA EKRANI (DASHBOARD)
     ========================================================== */
  const summaryCards = [
    {
      label: "Toplam Ziyaret (30 Gün)",
      value: data?.totalVisits ?? 0,
      sub: "Kaydedilen sayfa görüntülemesi",
      icon: BarChart3,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      label: "Tekil Ziyaretçi",
      value: data?.uniqueVisitors ?? 0,
      sub: "Benzersiz oturum sayısı",
      icon: Users,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
    {
      label: "Okuyucu Hata Bildirimi",
      value: data?.bugReportCount ?? 0,
      sub: "Risale-i Nur ekran bildirimi",
      icon: Bug,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      label: "Formspree Mesajları",
      value: data?.messageCount ?? 0,
      sub: data?.formspreeConfigured ? "Canlı Formspree API" : "E-posta ile iletiliyor",
      icon: MessageSquare,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300 pb-20">
      {/* Üst Yönetim Barı */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-white/[0.08] bg-white/85 dark:bg-[#0b0d13]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 pr-24 sm:pr-28">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  Mîkāt-ı Nur Yönetim Paneli
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Canlı
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Ziyaretçi istatistikleri, okuyucu bildirimleri ve sistem kontrol merkezi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchStats(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-gray-200 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Yenile</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.07] px-3 py-2 text-xs font-semibold text-slate-700 dark:text-gray-300 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Siteye Dön</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d111a] py-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mb-3" />
            <p className="text-sm text-slate-600 dark:text-gray-400">
              Yönetim paneli verileri yükleniyor...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 4'lü Üst Özet Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryCards.map(({ label, value, sub, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-5 shadow-sm flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-gray-500">
                      {sub}
                    </p>
                  </div>
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              ))}
            </div>

            {/* Sekme Seçici Bar */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d111a] text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Activity className="h-4 w-4" />
                <span>Ziyaretçi ve Site İstatistikleri</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("inbox")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "inbox"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d111a] text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Mesajlar &amp; Hata Bildirimleri</span>
                {((data?.bugReportCount ?? 0) + (data?.messageCount ?? 0)) > 0 && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-extrabold text-amber-300">
                    {(data?.bugReportCount ?? 0) + (data?.messageCount ?? 0)}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("system")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "system"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d111a] text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Server className="h-4 w-4" />
                <span>Sistem &amp; Modül Durumu</span>
              </button>
            </div>

            {/* SEKME 1: ZİYARETÇİ VE SİTE İSTATİSTİKLERİ */}
            {activeTab === "analytics" && (
              <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Detaylı Ziyaretçi ve Trafik Analizi
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                    Sayfa görüntülemeleri, ülke/şehir dağılımı, kullanılan cihazlar ve anlık ziyaret akışı
                  </p>
                </div>
                <AdminAnalyticsDashboard />
              </section>
            )}

            {/* SEKME 2: MESAJLAR VE OKUYUCU HATA BİLDİRİMLERİ */}
            {activeTab === "inbox" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sol: Okuyucu Hata Bildirimleri (bug-reports.json) */}
                <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Bug className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          Risale-i Nur Okuyucu Bildirimleri
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          Okuma ekranından gönderilen metin/lügat düzeltme bildirimleri
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full border border-slate-200 dark:border-white/10 px-2.5 py-0.5 text-xs font-bold">
                      {data?.bugReportCount ?? 0} Kayıt
                    </span>
                  </div>

                  {data?.bugReports && data.bugReports.length > 0 ? (
                    <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                      {data.bugReports.map((report) => (
                        <div
                          key={report.id}
                          className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="rounded-lg bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                              {report.bookTitle} • Sayfa {report.pageNumber}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-gray-500">
                              {report.createdAt
                                ? new Date(report.createdAt).toLocaleString("tr-TR")
                                : ""}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 leading-relaxed">
                            {report.description}
                          </p>
                          {report.reporterEmail && (
                            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                              Gönderen: {report.reporterEmail}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-10 text-center">
                      <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                        Bekleyen hata bildirimi bulunmuyor
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-gray-500">
                        Okuyucular Risale-i Nur sayfasından hata bildirdiğinde burada listelenir.
                      </p>
                    </div>
                  )}
                </section>

                {/* Sağ: İletişim Formu Mesajları (Formspree) */}
                <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          İletişim Formu Mesajları
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          /forum ve /contact sayfalarından gönderilen mesajlar
                        </p>
                      </div>
                    </div>

                    <a
                      href="https://formspree.io/forms/xkolwoep/submissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 transition-all"
                    >
                      <span>Formspree Paneli</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {data?.messages && data.messages.length > 0 ? (
                    <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                      {data.messages.map((msg, i) => (
                        <div
                          key={i}
                          className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                              {msg.name ? `${msg.name} (${msg.email})` : msg.email}
                            </span>
                            {msg.category && (
                              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-300">
                                {msg.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-gray-200 leading-relaxed">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-10 text-center">
                      <Mail className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-gray-300">
                        Mesajlar doğrudan e-posta adresinize iletiliyor
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
                        İletişim formundan gönderilen tüm mesajlar anında e-posta kutunuza düşer ve sağ üstteki{" "}
                        <strong>Formspree Paneli</strong> bağlantısından incelenebilir.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            )}

            {/* SEKME 3: SİSTEM VE MODÜL DURUMU */}
            {activeTab === "system" && (
              <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Aktif Platform Modülleri ve Servis Kontrolü
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                    Mîkāt-ı Nur Web sayfalarına ve Android uyumluluk API uç noktalarına hızlı erişim
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SYSTEM_MODULES.map(({ title, path, type, desc, icon: Icon }) => (
                    <Link
                      key={path}
                      href={path}
                      className="group rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] hover:border-blue-500/50 p-5 transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {type}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between gap-2">
                        <span>{title}</span>
                        <ArrowUpRight className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-600 dark:text-gray-400 leading-relaxed">
                        {desc}
                      </p>
                      <p className="mt-3 font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate">
                        {path}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

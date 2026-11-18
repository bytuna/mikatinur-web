import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Cpu,
  Download,
  Globe,
  HeartHandshake,
  MessageSquare,
  MoonStar,
  Palette,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Volume2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mîkāt-ı Nur | Android Uygulaması ve Web Ekosistemi",
  description:
    "Mîkāt-ı Nur Android mobil uygulaması (v1.1.9) ve Web platformu (mikatinur.com.tr): Hassas ezan vakitleri, Risale-i Nur Külliyatı, Kur'ân-ı Kerîm, Osmanlıca lügat, Kıble pusulası ve Dini Günler takvimi.",
  alternates: { canonical: "/projects/mikatinur/" },
};

const ecosystemStats = [
  {
    label: "Mobil Platform",
    value: "Android v1.1.9",
    sub: "Kotlin & Jetpack Compose",
    icon: Smartphone,
    color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
  },
  {
    label: "Web Platformu",
    value: "mikatinur.com.tr",
    sub: "Next.js 16 & AI Destekli",
    icon: Globe,
    color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  {
    label: "Manevi Kütüphane",
    value: "15 Cilt + Kur'ân",
    sub: "60.000+ Kelime Osmanlıca Lügat",
    icon: BookOpen,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    label: "Hizmet İlkemiz",
    value: "%100 Ücretsiz",
    sub: "Reklamsız & Gizlilik Odaklı",
    icon: ShieldCheck,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
];

const androidFeatures = [
  {
    title: "Hassas Ezan Vakitleri & Ana Ekran Widget'ları",
    desc: "Diyanet İşleri Başkanlığı uyumlu il/ilçe vakitleri, vakit öncesi ve vaktinde sesli ezan bildirimleri, kilit ekranı sayacı ve şık ana ekran widget desteği.",
    icon: Bell,
  },
  {
    title: "Kur'ân-ı Kerîm, Mushaf Görünümü & Sesli Tilavet",
    desc: "114 sûre, 604 sayfa Mushaf düzeni, Elmalılı Hamdi Yazır meali, ayet bazlı sesli tilavet dinleme ve kaldığınız yeri işaretleme imkânı.",
    icon: Volume2,
  },
  {
    title: "Risale-i Nur Külliyatı & Tıklamalı Osmanlıca Lügat",
    desc: "14+ cilt tam külliyat, kelimeye dokunulduğunda anında açılan Osmanlıca-Türkçe lügat penceresi, okuma temaları ve düzenli okuma takibi.",
    icon: BookOpen,
  },
  {
    title: "Kıble Pusulası, Tesbihat, Zikirmatik & Kazâ Takibi",
    desc: "Manyetik sensör destekli canlı Kıble pusulası, 5 vakit namaz tesbihatı, özelleştirilebilir zikir sayacı ve kazâ namazı/orucu çetelesi.",
    icon: Compass,
  },
];

const webFeatures = [
  {
    title: "Canlı Ezan Vakitleri, Kıble Açısı & Aylık İmsakiye",
    desc: "Ana sayfada dünya genelinde ülke, il ve ilçe bazlı saniye hassasiyetinde geri sayım sayacı, Büyük Daire Kıble açısı pusulası ve aylık vakit tablosu.",
    icon: Clock,
    href: "/",
    linkText: "Canlı Vakitleri Gör",
  },
  {
    title: "Risale-i Nur Web Mütalaa & Yapay Zeka Tefekkür Stüdyosu",
    desc: "Çift sayfa kitap mizanpajı, 6 okuma teması (Gündüz, Tefekkür, Saman, Göz Dostu, Kitap Kağıdı, Gece), 6 Arapça hat fontu, Kur'ân meali eşleştirme ve AI Tefekkür Asistanı.",
    icon: Sparkles,
    href: "/projects/risaleinur",
    linkText: "Okuma Stüdyosunu Aç",
  },
  {
    title: "Dini Günler Takvimi & Resmi Ramazan İmsakiyesi",
    desc: "Diyanet İşleri Başkanlığı canlı verileriyle sıradaki mübarek kandil ve bayrama geri sayım kartı ile il/ilçe bazlı 29/30 günlük Resmi Ramazan İmsakiyesi.",
    icon: MoonStar,
    href: "/projects/dini-gunler",
    linkText: "Dini Günler & İmsakiye",
  },
  {
    title: "Gündüz / Gece Modu & Kurulumsuz Anında Erişim",
    desc: "Bilgisayar, tablet ve telefon tarayıcılarından hiçbir kurulum gerektirmeden tam ekran okuma, külliyat içi gelişmiş arama ve görsel hata bildirim sistemi.",
    icon: Palette,
    href: "/forum",
    linkText: "Geri Bildirim Gönder",
  },
];

const interactiveModules = [
  {
    title: "Canlı Ezan Vakitleri",
    subtitle: "Ana Sayfa Vakit & Kıble Motoru",
    href: "/",
    badge: "Web & API",
    accent: "from-indigo-500/15 via-blue-500/5 to-transparent border-indigo-500/30 hover:border-indigo-500/60",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    icon: Clock,
  },
  {
    title: "Dini Günler & İmsakiye",
    subtitle: "Diyanet 2026/2027 Takvimi & Ramazan",
    href: "/projects/dini-gunler",
    badge: "Canlı Veri",
    accent: "from-emerald-500/15 via-teal-500/5 to-transparent border-emerald-500/30 hover:border-emerald-500/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    icon: Calendar,
  },
  {
    title: "Risale-i Nur Külliyatı",
    subtitle: "15 Cilt Mütalaa, Lügat & AI Tefekkür",
    href: "/projects/risaleinur",
    badge: "Okuma Stüdyosu",
    accent: "from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/30 hover:border-amber-500/60",
    iconColor: "text-amber-600 dark:text-amber-400",
    icon: BookOpen,
  },
  {
    title: "Android APK İndir",
    subtitle: "Mîkāt-ı Nur Mobil v1.1.9 (25,3 MB)",
    href: "/download",
    badge: "Resmi Sürüm",
    accent: "from-purple-500/15 via-fuchsia-500/5 to-transparent border-purple-500/30 hover:border-purple-500/60",
    iconColor: "text-purple-600 dark:text-purple-400",
    icon: Download,
  },
];

export default function MikatinurPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-gray-100 transition-colors duration-300 pb-20">
      {/* Arka Plan Işık Dokusu */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-36 left-1/2 h-[460px] w-[860px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-purple-500/10 via-blue-500/8 to-amber-500/10 blur-3xl" />
      </div>

      {/* Üst Bar */}
      <div className="relative z-10 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-[#0b0d13]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3 pr-24 sm:pr-28">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Ana Sayfaya Dön
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-[11px] font-medium text-purple-700 dark:text-purple-300">
            <Compass className="h-3.5 w-3.5" />
            <span>Mîkāt-ı Nur Dijital Ekosistemi</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
        {/* HERO BÖLÜMÜ */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-10 lg:p-12 shadow-lg dark:shadow-2xl mb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ezan ile Vakti Hatırlatır, Risale-i Nur ile Maneviyatla Parlatır</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Mîkāt-ı Nur{" "}
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-amber-600 dark:from-purple-400 dark:via-blue-400 dark:to-amber-300 bg-clip-text text-transparent">
                  Mobil &amp; Web
                </span>{" "}
                Platformu
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
                Zamanı anlamlı kılmak, sadece vaktin farkında olmakla değil; o vakti hakikatle doldurmakla mümkündür.{" "}
                <strong className="text-slate-900 dark:text-white">Mîkāt-ı Nur</strong>, hem{" "}
                <strong className="text-purple-600 dark:text-purple-400">Android mobil uygulaması</strong> hem de{" "}
                <strong className="text-blue-600 dark:text-blue-400">modern Web platformu (mikatinur.com.tr)</strong> ile
                günlük hayatınızın akışında ezan vakitlerini en hassas şekilde takip etmenizi sağlarken; Kur&apos;ân-ı Kerîm
                ve Risale-i Nur Külliyatı&apos;nı her an parmaklarınızın ucuna getirir.
              </p>

              {/* Hızlı Eylem Butonları */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-3 text-sm shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <Download className="h-4 w-4" />
                  Android Uygulamayı İndir (v1.1.9)
                </Link>

                <Link
                  href="/projects/risaleinur"
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-semibold px-5 py-3 text-sm transition-all hover:-translate-y-0.5"
                >
                  <BookOpen className="h-4 w-4" />
                  Web Külliyat Okuyucuyu Aç
                </Link>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-slate-700 dark:text-gray-200 font-semibold px-4 py-3 text-sm transition-all"
                >
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Canlı Ezan Vakitleri
                </Link>
              </div>
            </div>

            {/* Sağ Rozet / Ekosistem Özeti Kutusu */}
            <div className="shrink-0 lg:w-72 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-gray-300">
                  Sistem Durumu
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif &amp; Senkronize
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111622] p-3">
                  <div className="text-slate-400 dark:text-gray-500">Android Sürümü</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    v1.1.9 • 25,3 MB APK
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111622] p-3">
                  <div className="text-slate-400 dark:text-gray-500">Web &amp; API Motoru</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    Next.js 16 • Diyanet &amp; NOAA
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/70 dark:border-white/10 bg-white dark:bg-[#111622] p-3">
                  <div className="text-slate-400 dark:text-gray-500">Geliştirici</div>
                  <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                    İlker Tuna (ByTuna)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4'lü İstatistik Şeridi */}
          <div className="mt-8 pt-8 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {ecosystemStats.map(({ label, value, sub, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-4"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    {label}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {value}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-gray-400 truncate">
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* İKİ ANA PLATFORM VİTRİNİ: ANDROID UYGULAMASI & WEB SİTESİ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* SOL KART: ANDROID UYGULAMASI */}
          <div className="flex flex-col justify-between rounded-3xl border border-purple-500/25 dark:border-purple-500/20 bg-white dark:bg-[#0d111a] p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="inline-flex items-center gap-3">
                  <img
                    src="/mikat-nur-icon.png"
                    alt="Mîkāt-ı Nur Android İkonu"
                    width={46}
                    height={46}
                    className="h-12 w-12 rounded-2xl object-cover border border-emerald-600/30 shadow-sm shrink-0"
                  />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      Mobil Uygulama
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      Mîkāt-ı Nur Android
                    </h2>
                  </div>
                </div>

                <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
                  v1.1.9 APK
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed mb-6">
                Kotlin ve Jetpack Compose mimarisiyle geliştirilen Android uygulamamız; çevrimdışı çalışabilen kütüphanesi,
                ezan bildirimleri ve ana ekran widget&apos;larıyla günlük ibadet ve okuma hayatınızın cebinizdeki asistanıdır.
              </p>

              <div className="space-y-4">
                {androidFeatures.map(({ title, desc, icon: Icon }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-slate-50/70 dark:bg-white/[0.02] p-4"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Android 8.0+ tüm cihazlarla uyumlu • Reklamsız</span>
              </div>

              <Link
                href="/download"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 text-xs sm:text-sm transition-all"
              >
                <Download className="h-4 w-4" />
                APK İndirme Sayfasına Git
              </Link>
            </div>
          </div>

          {/* SAĞ KART: WEB PLATFORMU */}
          <div className="flex flex-col justify-between rounded-3xl border border-blue-500/25 dark:border-blue-500/20 bg-white dark:bg-[#0d111a] p-6 sm:p-8 shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="inline-flex items-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Web Platformu
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                      mikatinur.com.tr
                    </h2>
                  </div>
                </div>

                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
                  Next.js 16 &amp; AI
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed mb-6">
                Hiçbir kurulum gerektirmeden bilgisayar, tablet ve telefonunuzdan erişebileceğiniz Web platformumuz; canlı
                ezan vakitlerini, Dini Günler takvimini ve yapay zeka destekli Risale-i Nur mütalaa stüdyosunu bir araya getirir.
              </p>

              <div className="space-y-4">
                {webFeatures.map(({ title, desc, icon: Icon, href, linkText }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-slate-50/70 dark:bg-white/[0.02] p-4"
                  >
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {title}
                        </h3>
                        <Link
                          href={href}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                        >
                          {linkText}
                          <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Gündüz / Gece modu ve 6 özel okuma teması</span>
              </div>

              <Link
                href="/projects/risaleinur"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 text-xs sm:text-sm transition-all"
              >
                <BookOpen className="h-4 w-4" />
                Web Külliyatı Keşfet
              </Link>
            </div>
          </div>
        </section>

        {/* DOĞRUDAN KEŞFET: 4 MODÜL KARTI */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Platform Modüllerine Hızlı Geçiş
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Web sitemizdeki aktif araçları ve indirme merkezini doğrudan deneyimleyin
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {interactiveModules.map(({ title, subtitle, href, badge, accent, iconColor, icon: Icon }) => (
              <Link
                key={title}
                href={href}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${accent} bg-white dark:bg-[#0d111a] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/[0.06] ${iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-gray-300">
                    {badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{title}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">
                  {subtitle}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* ORTAK MİMARİ VE TEKNİK ALTYAPI */}
        <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
                <Cpu className="h-4 w-4" />
                <span>Senkronize Hibrit Altyapı</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Android ve Web Arasında Kesintisiz Vakit &amp; Veri Köprüsü
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                Mîkāt-ı Nur Web platformu üzerinde çalışan hibrit vakit motoru, Diyanet İşleri Başkanlığı resmi verileri ile
                NOAA güneş astronomisi algoritmalarını (<code className="text-indigo-600 dark:text-indigo-300">18°/17°</code>{" "}
                ve Ümmü&apos;l-Kurâ) birleştirir. Hem web sitemiz hem de Android uygulamamız aynı yüksek doğruluklu API
                altyapısını kullanarak her koşulda kesintisiz hizmet verir.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Kotlin & Jetpack Compose",
                  "Next.js 16 App Router",
                  "TypeScript 5",
                  "Diyanet & NOAA Astronomi Motoru",
                  "Büyük Daire Kıble Matematiği",
                  "Gemini AI Tefekkür Asistanı",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-gray-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
              <Link
                href="/forum"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold px-5 py-3 text-xs sm:text-sm transition-all"
              >
                <MessageSquare className="h-4 w-4" />
                Görüş &amp; Öneri Paylaş
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-gray-300 font-semibold px-5 py-3 text-xs sm:text-sm transition-all"
              >
                <HeartHandshake className="h-4 w-4 text-rose-500" />
                İletişim Sayfası
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

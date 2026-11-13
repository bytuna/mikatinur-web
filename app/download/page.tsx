import type { Metadata } from "next";
import Image from 'next/image';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Compass,
  Download,
  FileCheck2,
  HardDrive,
  Headphones,
  Lock,
  MonitorSmartphone,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Uygulamayı İndir | Mîkāt-ı Nur Android APK",
  description:
    "Mîkāt-ı Nur Android mobil uygulamasının (v1.1.7) resmi, reklamsız ve güvenli APK indirme merkezi, kurulum rehberi ve sürüm notları.",
  alternates: { canonical: "/download/" },
};

const apkInfo = {
  version: "v1.1.7",
  sizeLabel: "25,32 MB",
  updatedAt: "12 Kasım 2026",
  url: "/apk/Mikat-Nur-v1.1.7.apk",
  fileName: "Mikat-Nur-v1.1.7.apk",
  minAndroid: "Android 8.0+",
};

const installSteps = [
  {
    step: "1. Adım",
    title: "APK Paketini İndirin",
    desc: "Yukarıdaki \"APK İndir\" butonuna dokunarak resmi kurulum dosyasını (Mikat-Nur-v1.1.7.apk) cihazınıza kaydedin.",
    icon: Download,
    color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  },
  {
    step: "2. Adım",
    title: "Kurulum İznini Onaylayın",
    desc: "Uygulama Google Play dışında doğrudan resmi sitemizden yüklendiği için Android'in standart \"Bilinmeyen kaynaklardan yükleme / Yine de yükle\" onayını verin.",
    icon: FileCheck2,
    color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  },
  {
    step: "3. Adım",
    title: "Kullanmaya Başlayın",
    desc: "Kurulum tamamlandığında uygulamayı açıp konumunuzu seçerek ezan vakitleri, Kur'ân-ı Kerîm ve Risale-i Nur Külliyatı'na reklamsız erişin.",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  },
];

const v117Notes = [
  {
    title: "Ses Çalma & Medya Kontrolleri",
    icon: Headphones,
    accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    items: [
      "Kulaklık ve kilit ekranı çal/duraklat düğmeleri çalışır hale getirildi.",
      "Ekran kapalıyken Kur'ân-ı Kerîm sesi kesilmeden oynamaya devam eder.",
    ],
  },
  {
    title: "Ekran & Okuma Arayüzü",
    icon: MonitorSmartphone,
    accent: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    items: [
      "Kur'ân, Risale-i Nur ve Tesbihat ekranlarında okuma sırasında ekran kararması engellendi.",
      "AI arka plan üretimi kaldırıldı; hızlı ve ücretsiz statik arka planlar kullanılıyor.",
    ],
  },
  {
    title: "Güvenlik & Gizlilik",
    icon: Lock,
    accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    items: [
      "Şifresiz ağ trafiği kapatıldı, hassas loglar kaldırıldı ve yedekleme güvenliği sıkılaştırıldı.",
    ],
  },
];

const v116Notes = [
  {
    title: "Kur'ân-ı Kerîm Modülü",
    icon: BookOpen,
    items: [
      "Yeni Kur'ân-ı Kerîm modülü: sûre, cüz, sayfa ve hatim sekmeleri.",
      "13 okuyucu (5 Kâbe imamı dâhil) ve 1x–2x okuma hızı seçeneği.",
      "Kalınan ayetten devam etme ve yazı tipi ön izlemesi.",
    ],
  },
  {
    title: "Zikirmatik & Tesbihat",
    icon: Sparkles,
    items: [
      "12 hazır zikir: Arapçası, Türkçe anlamı ve ne için çekildiği.",
      "Kendi zikrinizi yazma veya yapıştırma, hedef ve tur sayacı.",
      "Toplam sayacı sıfırlama imkânı.",
    ],
  },
  {
    title: "Profil & Yedekleme",
    icon: UserCheck,
    items: [
      "Profil ekranı, haftalık özet ve kullanım serisi.",
      "Ayarlar, hatim ve zikir bilgilerini yedekleme ve geri yükleme.",
    ],
  },
  {
    title: "Genel İyileştirmeler",
    icon: Compass,
    items: [
      "Güncelleme denetimi indirme sayfasından yapılıyor.",
      "Bildirimdeki kalan dakika göstergesi düzeltildi.",
      "Paylaşım kartlarında rastgele arka plan resimleri ve yenilenen Risale-i Nur ekran renkleri.",
    ],
  },
];

export default function DownloadPage() {
  const infoCards = [
    {
      label: "Sürüm",
      value: apkInfo.version,
      sub: "Kararlı Sürüm",
      icon: PackageCheck,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
    },
    {
      label: "Boyut",
      value: apkInfo.sizeLabel,
      sub: "Hızlı İndirme",
      icon: HardDrive,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    },
    {
      label: "Son güncelleme",
      value: apkInfo.updatedAt,
      sub: "Resmi Dağıtım",
      icon: Calendar,
      color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
    },
    {
      label: "Doğrulama",
      value: "%100 Güvenli",
      sub: "Reklamsız & İmzalı",
      icon: ShieldCheck,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-gray-100 transition-colors duration-300 pb-20">
      {/* Arka Plan Işık Dokusu */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-36 left-1/2 h-[440px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-blue-500/10 via-purple-500/8 to-emerald-500/10 blur-3xl" />
      </div>

      {/* Üst Bar */}
      <div className="relative z-10 border-b border-slate-200/80 dark:border-white/[0.07] bg-white/80 dark:bg-[#0b0d13]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3 pr-24 sm:pr-28">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ana Sayfa
            </Link>

            <Link
              href="/projects/mikatinur"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/[0.02] px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <Smartphone className="h-3.5 w-3.5 text-purple-500" />
              Uygulama Tanıtımı
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-700 dark:text-blue-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Resmi APK Dağıtım Merkezi</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 pt-8 sm:pt-12">
        {/* ANA İNDİRME HERO KARTI */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-10 shadow-lg dark:shadow-2xl mb-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"
          />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-4">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Son Sürüm Hazır • {apkInfo.version}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Mîkāt-ı Nur Android Uygulamasını İndir
              </h1>

              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-gray-300 leading-relaxed">
                Hassas ezan vakitleri, sesli bildirimler, Kur&apos;ân-ı Kerîm tilaveti, 14+ cilt Risale-i Nur Külliyatı,
                Osmanlıca lügat, Kıble pusulası ve Zikirmatik modüllerini tek bir reklamsız uygulamada deneyimleyin.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1 font-medium">
                  <Smartphone className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  {apkInfo.minAndroid} Uyumlu
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  %100 Ücretsiz &amp; Reklamsız
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-2.5 py-1 font-mono">
                  {apkInfo.fileName}
                </span>
              </div>
            </div>

            {/* Sağ İndirme ve Doğrudan Karekod (QR) Kutusu */}
            <div className="shrink-0 lg:w-96 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/[0.08] to-purple-500/[0.04] dark:from-blue-500/[0.12] dark:to-purple-500/[0.05] p-5 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/mikat-nur-icon.png"
                  alt="Mîkāt-ı Nur Android İkonu"
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl object-cover border border-emerald-600/30 shadow-sm shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      Mîkāt-ı Nur Android APK
                    </h2>
                    <span className="rounded-full bg-blue-600 text-white px-2.5 py-0.5 text-xs font-bold shrink-0">
                      {apkInfo.version}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-400 break-all font-mono">
                    {apkInfo.fileName} ({apkInfo.sizeLabel})
                  </p>
                </div>
              </div>

              <a
                href={apkInfo.url}
                download={apkInfo.fileName}
                className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 font-bold text-sm sm:text-base shadow-md shadow-blue-600/20 transition-all hover:-translate-y-0.5"
              >
                <Download className="h-5 w-5" />
                <span>Hemen İndir ({apkInfo.version})</span>
              </a>

              {/* Doğrudan APK İndirme Karekodu (QR) */}
              <div className="mt-4 pt-4 border-t border-blue-500/20 flex items-center gap-3.5">
                <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                  <img
                    src="/apk/qr-mikat-nur.svg"
                    alt="Mîkāt-ı Nur Android APK Doğrudan İndirme Karekodu"
                    width={96}
                    height={96}
                    className="h-24 w-24 block"
                  />
                </div>

                <div className="min-w-0">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
                    <QrCode className="h-3.5 w-3.5 shrink-0" />
                    <span>Kamerayla Okut &amp; İndir</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed">
                    Telefon kameranızı karekoda tutarak{" "}
                    <strong className="text-slate-900 dark:text-white">{apkInfo.fileName}</strong>{" "}
                    dosyasını doğrudan cihazınıza indirebilirsiniz.
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] text-center text-slate-500 dark:text-gray-400">
                Doğrudan sunucumuzdan güvenli bağlantı (HTTPS) ile indirilir.
              </p>
            </div>
          </div>

          {/* 4'lü Bilgi Kartları */}
          <div className="mt-8 pt-8 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {infoCards.map(({ label, value, sub, icon: Icon, color }) => (
              <div
                key={label}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/[0.02] p-4"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-600 dark:text-gray-300">
                    {label}
                  </div>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {value}
                  </p>
                  <div className="text-xs text-slate-500 dark:text-gray-400">
                    {sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3 ADIMLI KURULUM REHBERİ */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                3 Adımda Kolay Kurulum Rehberi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Google Play Store dışından doğrudan APK kurulumu için aşağıdaki adımları takip edebilirsiniz
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {installSteps.map(({ step, title, desc, icon: Icon, color }) => (
              <div
                key={step}
                className="rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:text-gray-300">
                    {step}
                  </span>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SÜRÜM NOTLARI (CHANGELOG) */}
        <section className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#0d111a] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-200/80 dark:border-white/10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Sürüm Geçmişi ve Güncellemeler
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-gray-400">
                Mîkāt-ı Nur Android uygulamasında yapılan son yenilikler ve hata düzeltmeleri
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              <PackageCheck className="h-3.5 w-3.5" />
              Güncel: {apkInfo.version}
            </span>
          </div>

          {/* v1.1.7 Sürüm Notları */}
          <div className="mt-6">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="rounded-lg bg-blue-600 text-white px-2.5 py-1 text-xs font-bold">
                v1.1.7
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                v1.1.7 sürümünde yapılan iyileştirmeler
              </h3>
              <span className="text-xs text-slate-400 dark:text-gray-500 hidden sm:inline">
                • {apkInfo.updatedAt}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {v117Notes.map(({ title, icon: Icon, accent, items }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/80 dark:bg-white/[0.02] p-5"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {title}
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* v1.1.6 Sürüm Notları */}
          <div className="mt-8 pt-8 border-t border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="rounded-lg border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-gray-300 px-2.5 py-1 text-xs font-bold">
                v1.1.6
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-200">
                v1.1.6 sürümünde yapılan iyileştirmeler
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {v116Notes.map(({ title, icon: Icon, items }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-200/80 dark:border-white/[0.07] bg-slate-50/60 dark:bg-white/[0.015] p-5"
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200/70 dark:bg-white/[0.06] text-slate-700 dark:text-gray-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {title}
                    </h4>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-gray-400">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-gray-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-6 text-xs text-slate-500 dark:text-gray-500 text-center">
          Mîkāt-ı Nur kurulum paketi ({apkInfo.fileName}), resmi sunucumuz üzerinden şifreli bağlantı ile güvenli şekilde indirilir.
        </p>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft, Calendar, Download, HardDrive, PackageCheck } from "lucide-react";

const apkInfo = {
  version: "v1.1.7",
  sizeLabel: "25,32 MB",
  updatedAt: "12 Kasım 2026",
  url: "/apk/Mikat-Nur-v1.1.7.apk",
  fileName: "Mikat-Nur-v1.1.7.apk",
};

export default function DownloadPage() {
  const infoCards = [
    { label: "Sürüm", value: apkInfo.version, icon: PackageCheck },
    { label: "Boyut", value: apkInfo.sizeLabel, icon: HardDrive },
    { label: "Son güncelleme", value: apkInfo.updatedAt, icon: Calendar },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center py-16 px-4 sm:py-24 sm:px-6">
      <div className="max-w-2xl w-full">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white mb-6 sm:mb-8 text-sm sm:text-base">
          <ArrowLeft className="mr-2 w-4 h-4" /> Ana Sayfa
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">Uygulamayı İndir</h1>

        <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {infoCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-3 sm:p-4">
              <div className="flex items-center gap-2 text-blue-300">
                <Icon className="w-4 h-4" />
                <span className="text-[10px] sm:text-xs uppercase tracking-wide">{label}</span>
              </div>
              <p className="mt-2 text-sm sm:text-lg font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-4 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h2 className="text-lg sm:text-xl font-bold">Mîkāt-ı Nur Android APK</h2>
            <p className="text-gray-400 mt-2 text-xs sm:text-sm break-all">{apkInfo.fileName}</p>
          </div>

          <a
            href={apkInfo.url}
            download={apkInfo.fileName}
            className="flex w-full sm:w-auto items-center justify-center bg-blue-600 hover:bg-blue-700 px-5 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base"
          >
            <Download className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> İndir
          </a>
        </div>

        <p className="text-gray-400 mt-3 text-sm sm:text-base">
          ⚠️ Dikkat: Uygulamayı yüklerken "Riskli olabilir" uyarısı alabilirsiniz. Bu, uygulama Google Play Store dışında bir yerden yüklendiği için Android'in verdiği standart bir uyarıdır.
        </p>
        <p className="text-gray-400 mt-3 text-sm sm:text-base">
          🚀 Not: Bilinmeyen kaynaklardan uygulama yükleme iznini açmayı unutmayınız.
        </p>

        <section className="mt-6 sm:mt-8 bg-gray-900/30 border border-gray-800 rounded-3xl p-4 sm:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-white">Güncellemeler</h2>
          <p className="mt-2 text-sm sm:text-base text-blue-200">v1.1.7 sürümünde yapılan iyileştirmeler</p>
          <ul className="mt-5 space-y-4 text-sm sm:text-base text-gray-300">
            <li className="rounded-xl border border-gray-800 bg-black/20 p-3 sm:p-4">
              <h3 className="font-semibold text-white">Ses çalma</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Kulaklık ve kilit ekranı çal/duraklat düğmeleri çalışır hale getirildi.</li>
                <li>Ekran kapalıyken Kur'an sesi kesilmeden oynamaya devam eder.</li>
              </ul>
            </li>
            <li className="rounded-xl border border-gray-800 bg-black/20 p-3 sm:p-4">
              <h3 className="font-semibold text-white">Ekran ve arayüz</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Kur'an, Risale ve Tesbihat ekranlarında ekran kararması engellendi.</li>
                <li>AI arka plan üretimi kaldırıldı; ücretsiz statik arka planlar kullanılıyor.</li>
              </ul>
            </li>
            <li className="rounded-xl border border-gray-800 bg-black/20 p-3 sm:p-4">
              <h3 className="font-semibold text-white">Güvenlik</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Şifresiz ağ trafiği kapatıldı, hassas loglar kaldırıldı, yedekleme kısıtlandı.</li>
              </ul>
            </li>
          </ul>

          <div className="mt-8 border-t border-gray-800 pt-6">
            <p className="text-sm sm:text-base text-gray-500">v1.1.6 sürümünde yapılan iyileştirmeler</p>
          <ul className="mt-5 space-y-4 text-sm sm:text-base text-gray-300">
            <li className="rounded-xl border border-gray-800 bg-black/20 p-3 sm:p-4">
              <h3 className="font-semibold text-white">Kur'an-ı Kerim</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Yeni Kur'an-ı Kerim modülü: sure, cüz, sayfa ve hatim sekmeleri.</li>
                <li>13 okuyucu (5 Kâbe imamı dâhil) ve 1x–2x okuma hızı seçeneği.</li>
                <li>Kalınan ayetten devam etme ve yazı tipi ön izlemesi.</li>
              </ul>
            </li>
            <li className="rounded-xl border border-gray-800 bg-black/20 p-3 sm:p-4">
              <h3 className="font-semibold text-white">Zikirmatik</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>12 hazır zikir: Arapçası, Türkçe anlamı ve ne için çekildiği.</li>
                <li>Kendi zikrinizi yazma veya yapıştırma, hedef ve tur sayacı.</li>
                <li>Toplam sayacı sıfırlama.</li>
              </ul>
            </li>
            <li className="rounded-xl border border-gray-800 bg-black/20 p-3 sm:p-4">
              <h3 className="font-semibold text-white">Profil ve yedekleme</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Profil ekranı, haftalık özet ve kullanım serisi.</li>
                <li>Ayarlar, hatim ve zikir bilgilerini yedekleme ve geri yükleme.</li>
              </ul>
            </li>
            <li className="rounded-xl border border-gray-800 bg-black/20 p-3 sm:p-4">
              <h3 className="font-semibold text-white">Genel iyileştirmeler</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Güncelleme denetimi indirme sayfasından yapılıyor.</li>
                <li>Bildirimdeki kalan dakika göstergesi düzeltildi.</li>
                <li>Paylaşım kartlarında rastgele arka plan resimleri.</li>
                <li>Risale-i Nur ekranı renkleri yenilendi.</li>
              </ul>
            </li>
          </ul>
          </div>
        </section>
        <p className="mt-6 text-xs sm:text-sm text-gray-600 text-center">
          Dosya, Hostinger sunucumuzdan güvenli şekilde indirilir.
        </p>
      </div>
    </main>
  );
}
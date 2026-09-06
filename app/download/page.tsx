import Link from "next/link";
import { ArrowLeft, Calendar, Download, HardDrive, PackageCheck } from "lucide-react";

const apkInfo = {
  version: "v1.1.4",
  sizeLabel: "58,7 MB",
  updatedAt: "6 Eylül 2026",
  url: "https://apk.mikatinur.com.tr/Mikat-Nur-v1.1.4.apk",
  fileName: "Mikat-Nur-v1.1.4.apk",
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
          <p className="mt-2 text-sm sm:text-base text-blue-200">Tefeül dersleri ve UI optimizasyonları</p>
          <ul className="mt-5 space-y-5 text-sm sm:text-base text-gray-300">
            <li>
              <h3 className="font-semibold text-white">Tesbihat Okuma Ekranı:</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Arka plan temiz beyaz renge çevrildi ve yüksek kontrastlı renk paleti uygulandı.</li>
                <li>Arapça metinler için Uthman Taha (uthman_taha.ttf) hattı entegre edildi.</li>
              </ul>
            </li>
            <li>
              <h3 className="font-semibold text-white">Vakit Sekmeleri Optimizasyonu:</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>5 vakit (Sabah, Öğle, İkindi, Akşam, Yatsı) küçük ekranlı cihazlarda kaydırma gerektirmeden ekrana sığdırıldı.</li>
              </ul>
            </li>
            <li>
              <h3 className="font-semibold text-white">TopBar &amp; Tefeül Entegrasyonu:</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-gray-400">
                <li>Üst bara &quot;Tefeül&quot; butonu eklendi.</li>
                <li>Tefeül dersleri eklendi.</li>
              </ul>
            </li>
          </ul>
        </section>
        <p className="mt-6 text-xs sm:text-sm text-gray-600 text-center">
          Dosya, Hostinger sunucumuzdan güvenli şekilde indirilir.
        </p>
      </div>
    </main>
  );
}
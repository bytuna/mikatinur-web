import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center py-24 px-6">
      <div className="max-w-2xl w-full">
        <Link href="/" className="inline-flex items-center text-gray-500 hover:text-white mb-8">
          <ArrowLeft className="mr-2 w-4 h-4" /> Ana Sayfa
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8">Uygulamayı İndir</h1>
        
        <div className="bg-gray-900/30 border border-gray-800 rounded-3xl p-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">MikatiNur Android APK</h2>
            <p className="text-gray-400 mt-2">En güncel sürüm (v1.0.1+)</p>
          </div>
          
          {/* GitHub Latest Release Linki */}
          <a 
            href="https://github.com/bytuna/MikatiNur/releases/download/v1.0.1/Mikat-Nur-v1.0.1.apk" 
            className="flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all"
          >
            <Download className="mr-2 w-5 h-5" /> İndir
          </a>
        </div>
        
        <p className="mt-6 text-sm text-gray-600 text-center">
          Dosya otomatik olarak GitHub üzerinden en güncel sürümü indirir.
        </p>
      </div>
    </main>
  );
}
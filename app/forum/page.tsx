import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForumPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center py-24 px-6">
      <div className="max-w-xl w-full">
        {/* Ana Sayfaya Dön Butonu */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Ana Sayfaya Dön
        </Link>

        {/* Başlık ve Açıklama */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Geri Bildirim & İletişim</h1>
          <p className="text-gray-400">
            MikatiNur projesi hakkındaki görüşlerinizi, önerilerinizi veya hata bildirimlerinizi bizimle paylaşın.
          </p>
        </div>
        
        {/* Form Alanı */}
        <form 
          action="https://formspree.io/f/xkolwoep" 
          method="POST"
          className="bg-gray-900/30 border border-gray-800 rounded-3xl p-8 space-y-6"
        >
          {/* Yönlendirme Ayarı */}
          <input type="hidden" name="_next" value="https://mikatinur.com.tr/" />

          <div>
            <label className="block text-sm text-gray-400 mb-2">Adınız</label>
            <input 
              type="text" 
              name="name" 
              required
              className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">E-posta Adresiniz</label>
            <input 
              type="email" 
              name="email" 
              required
              className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Konu / Mesajınız</label>
            <textarea 
              name="message" 
              required
              rows={5}
              className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-900/20"
          >
            Mesajı Gönder
          </button>
        </form>

        {/* Küçük bir bilgilendirme notu */}
        <p className="mt-8 text-center text-sm text-gray-600">
          * Mesajlarınız doğrudan sistem yöneticisine e-posta olarak iletilecektir.
        </p>
      </div>
    </main>
  );
}
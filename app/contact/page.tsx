export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-white p-6 md:p-12 flex items-center justify-center transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-[#111] border border-slate-200 dark:border-gray-800 shadow-sm dark:shadow-none p-8 rounded-3xl">
        <a href="/" className="text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white mb-6 block text-sm transition-colors">← Ana Sayfaya Dön</a>
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">Bize Ulaşın</h1>
        
        <form action="https://formspree.io/f/xkolwoep" method="POST" className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1">E-posta</label>
            <input type="email" name="email" required className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl p-3 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1">Mesajınız</label>
            <textarea name="message" required rows={4} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white rounded-xl p-3 outline-none focus:border-blue-500"></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all">Gönder</button>
        </form>
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-md w-full bg-[#111] border border-gray-800 p-8 rounded-3xl">
        <a href="/" className="text-gray-500 hover:text-white mb-6 block text-sm">← Ana Sayfaya Dön</a>
        <h1 className="text-3xl font-bold mb-6">Bize Ulaşın</h1>
        
        {/* Endpoint kısmına kendi Formspree linkini yapıştır */}
        <form action="https://formspree.io/f/xkolwoep" method="POST" className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">E-posta</label>
            <input type="email" name="email" required className="w-full bg-[#0a0a0a] border border-gray-700 rounded-xl p-3 outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mesajınız</label>
            <textarea name="message" required rows={4} className="w-full bg-[#0a0a0a] border border-gray-700 rounded-xl p-3 outline-none focus:border-blue-500"></textarea>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold py-3 rounded-xl transition-all">Gönder</button>
        </form>
      </div>
    </main>
  );
}
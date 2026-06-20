export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold mb-6 tracking-tight">Mikat-ı Nur</h1>
        <p className="text-xl text-gray-400 mb-10 leading-relaxed">
          Risale-i Nur külliyatını dijital dünyada aslına uygun, yapılandırılmış ve 
          modern bir arayüzle deneyimleyin. Android ekosistemi için geliştirilmiş, 
          gelişmiş indeksleme ve navigasyon özellikleri ile keşfe çıkın.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-gray-200 transition">
            Uygulamayı İndir
          </button>
          <button className="border border-gray-700 px-8 py-3 rounded-full hover:bg-gray-800 transition">
            Daha Fazla Bilgi
          </button>
        </div>
      </div>
      
      <footer className="absolute bottom-8 text-gray-600 text-sm">
        © 2026 Mikat-ı Nur • İlker TUNA
      </footer>
    </main>
  );
}
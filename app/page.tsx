export default function Home() {
  const apps = [
    { name: "Mikat-ı Nur", desc: "Dijital Risale-i Nur Kütüphanesi", tag: "Aktif" },
    { name: "Namaz Vakti", desc: "Adhan ve Takvim Uygulaması", tag: "Beta" },
    { name: "Güvenli Aile", desc: "Parental Control Çözümü", tag: "Geliştirmede" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-6">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-6xl font-bold mb-6 tracking-tight">Mikat-ı Nur</h1>
        <p className="text-xl text-gray-400 mb-16 leading-relaxed">
          İlker TUNA tarafından geliştirilen Android yazılım ekosistemi.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div key={app.name} className="border border-gray-800 p-6 rounded-2xl hover:border-gray-500 transition">
              <h2 className="text-xl font-bold mb-2">{app.name}</h2>
              <p className="text-gray-400 text-sm mb-4">{app.desc}</p>
              <span className="text-xs bg-gray-900 px-2 py-1 rounded">{app.tag}</span>
            </div>
          ))}
        </div>
      </div>
      
            <footer className="mt-20 text-gray-600 text-sm flex gap-6">
  <p>© 2026 Mikat-ı Nur • İlker TUNA</p>
  <a href="mailto:iletisim@mikatinur.com.tr" className="hover:text-white transition">İletişim</a>
  <a href="https://github.com/bytuna" target="_blank" className="hover:text-white transition">GitHub</a>
</footer>
      <section className="mt-20 w-full max-w-4xl">
  <h3 className="text-2xl font-bold mb-8 text-center text-gray-300">Geliştirme Günlüğü</h3>
  <div className="space-y-4">
    <div className="border-l border-gray-800 pl-6 py-2">
      <h4 className="text-white font-medium">Mikat-ı Nur JSON Optimizasyonu</h4>
      <p className="text-gray-500 text-sm">Sözler ve Mektubat için indeksleme yapısı tamamlandı.</p>
    </div>
    <div className="border-l border-gray-800 pl-6 py-2">
      <h4 className="text-white font-medium">Firebase Entegrasyonu</h4>
      <p className="text-gray-500 text-sm">Parental control uygulaması için remote command altyapısı kuruluyor.</p>
    </div>
  </div>
</section>
    </main>
  );
}
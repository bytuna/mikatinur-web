import Link from 'next/link';
import { BookOpen, Clock, ShieldCheck } from 'lucide-react';

export default function Home() {
  const apps = [
    { name: "Mikat-ı Nur", desc: "Dijital Kütüphane", icon: <BookOpen />, path: "/projects/mikatinur" },
    { name: "Namaz Vakti", desc: "Adhan & SQLite", icon: <Clock />, path: "/projects/namaz-vakti" },
    { name: "Güvenli Aile", desc: "Firebase Security", icon: <ShieldCheck />, path: "/projects/guvenli-aile" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0a0a0a] text-white p-6 pt-24">
      <div className="max-w-4xl w-full">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tighter">Mikat-ı Nur</h1>
        <p className="text-xl text-gray-400 mb-16 border-l-2 border-white pl-4">
          İlker TUNA tarafından geliştirilen Android tabanlı dijital ekosistem.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-24">
          {apps.map((app) => (
            <Link key={app.name} href={app.path} className="group border border-gray-800 p-8 rounded-3xl bg-[#111] hover:bg-[#1a1a1a] hover:border-gray-500 transition-all duration-300">
              <div className="text-blue-500 mb-4">{app.icon}</div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{app.name}</h2>
              <p className="text-gray-500 text-sm">{app.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      
      <footer className="w-full max-w-4xl border-t border-gray-800 pt-8 mt-auto mb-12 flex justify-between text-gray-500 text-sm">
        <p>© 2026 Mikat-ı Nur • İlker TUNA</p>
        <div className="flex gap-6">
  <Link href="/contact" className="hover:text-white transition">İletişim</Link>
  <a href="https://github.com/bytuna" target="_blank" className="hover:text-white transition">GitHub</a>
</div>
      </footer>
    </main>
  );
}
import Link from 'next/link';
import { BookOpen, Clock, ShieldCheck, ArrowRight, MessageSquare, Download, Lock } from 'lucide-react';

export default function Home() {
  const cards = [
    { 
      title: "Mikat-ı Nur", 
      desc: "Dijital Kütüphane Sistemi", 
      icon: <BookOpen className="w-8 h-8" />, 
      href: "/projects/mikatinur",
      bg: "hover:border-purple-500/50 hover:bg-purple-900/10"
    },
    { 
      title: "Namaz Vakti", 
      desc: "SQLite destekli Takvim", 
      icon: <Clock className="w-8 h-8" />, 
      href: "/projects/namaz-vakti",
      bg: "hover:border-indigo-500/50 hover:bg-indigo-900/10"
    },
    { 
      title: "Güvenli Aile", 
      desc: "Firebase ebeveyn denetimi", 
      icon: <ShieldCheck className="w-8 h-8" />, 
      href: "/projects/guvenli-aile",
      bg: "hover:border-blue-500/50 hover:bg-blue-900/10"
    },
    { 
      title: "İletişim", 
      desc: "Geri bildirim ve mesajlar", 
      icon: <MessageSquare className="w-8 h-8" />, 
      href: "/forum",
      bg: "hover:border-green-500/50 hover:bg-green-900/10"
    },
    { 
      title: "İndir", 
      desc: "APK ve uygulama dosyaları", 
      icon: <Download className="w-8 h-8" />, 
      href: "/download",
      bg: "hover:border-blue-500/50 hover:bg-blue-900/10"
    },
    { 
      title: "Admin", 
      desc: "Panel yönetimi", 
      icon: <Lock className="w-8 h-8" />, 
      href: "/admin",
      bg: "hover:border-red-500/50 hover:bg-red-900/10"
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-gray-100 flex flex-col items-center py-24 px-6">
      <div className="max-w-4xl w-full mb-20">
        <h1 className="text-6xl font-black text-white mb-4">Mikat-ı Nur</h1>
        <p className="text-xl text-gray-400 font-light">İlker TUNA tarafından dijital dünyaya taşınan manevi miras.</p>
      </div>

      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link 
            key={card.title} 
            href={card.href}
            className={`group p-8 rounded-3xl border border-gray-800 bg-gray-900/20 backdrop-blur-sm transition-all hover:scale-[1.02] ${card.bg}`}
          >
            <div className="text-gray-400 mb-6 group-hover:text-white transition-colors">{card.icon}</div>
            <h2 className="text-xl font-bold text-white mb-2">{card.title}</h2>
            <p className="text-sm text-gray-400 mb-6">{card.desc}</p>
            <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-white">
              Görüntüle <ArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
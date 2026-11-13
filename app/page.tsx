import Link from "next/link";
import { BookOpen, Clock, MessageSquare, Download, Lock, Compass, ArrowUpRight } from "lucide-react";
import NamazVaktiClient from "./projects/namaz-vakti/NamazVaktiClient";
import { getMonth } from "@/lib/prayer/service";
import { DEFAULT_ID, resolveLists } from "@/lib/prayer/places";
import type { InitialLists, MonthResponse } from "@/lib/prayer/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initial: MonthResponse | null = null;
  let lists: InitialLists | null = null;

  try {
    initial = await getMonth(DEFAULT_ID);
  } catch {
    initial = null;
  }

  if (initial) {
    try {
      lists = await resolveLists(initial.place);
    } catch {
      lists = null;
    }
  }

  const cards = [
    {
      title: "Mîkāt-ı Nur",
      desc: "Kütüphane",
      icon: <Compass className="w-3.5 h-3.5" />,
      href: "/projects/mikatinur",
      accent: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
      border: "hover:border-purple-400 dark:hover:border-purple-500/50 hover:bg-purple-50/60 dark:hover:bg-purple-900/15",
    },
    {
      title: "Dini Günler",
      desc: "İmsakiye & Takvim",
      icon: <Clock className="w-3.5 h-3.5" />,
      href: "/projects/dini-gunler",
      accent: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
      border: "hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-900/15",
    },
    {
      title: "Risale-i Nur",
      desc: "Okuma",
      icon: <BookOpen className="w-3.5 h-3.5" />,
      href: "/projects/risaleinur",
      accent: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
      border: "hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-blue-50/60 dark:hover:bg-blue-900/15",
    },
    {
      title: "İletişim",
      desc: "Mesajlar",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
      href: "/forum",
      accent: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
      border: "hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/15",
    },
    {
      title: "İndir",
      desc: "Android APK",
      icon: <Download className="w-3.5 h-3.5" />,
      href: "/download",
      accent: "text-sky-600 dark:text-sky-400 bg-sky-500/10",
      border: "hover:border-sky-400 dark:hover:border-sky-500/50 hover:bg-sky-50/60 dark:hover:bg-sky-900/15",
    },
    {
      title: "Admin",
      desc: "Yönetim",
      icon: <Lock className="w-3.5 h-3.5" />,
      href: "/admin",
      accent: "text-rose-600 dark:text-rose-400 bg-rose-500/10",
      border: "hover:border-rose-400 dark:hover:border-rose-500/50 hover:bg-rose-50/60 dark:hover:bg-rose-900/15",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {/* ÜST MODERN BAŞLIK VE TEK SIRA SAYFA KARTLARI ŞERİDİ */}
      <header className="relative z-20 border-b border-slate-200/80 dark:border-white/10 bg-white/75 dark:bg-[#050505]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-5xl px-3 sm:px-6 pt-4 pb-3">
          <div className="flex items-center justify-between gap-2 mb-3 pr-28 sm:pr-32">
            <div className="flex items-center gap-3">
              <img
                src="/mikat-nur-icon.png"
                alt="Mîkāt-ı Nur İkonu"
                width={38}
                height={38}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover border border-emerald-600/30 shadow-sm shrink-0"
              />
              <div className="flex items-baseline gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Mîkāt-ı Nur
                </h1>
                <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-gray-600">•</span>
                <p className="hidden sm:inline-block text-xs text-slate-500 dark:text-gray-400 font-normal">
                  Dijital dünyaya taşınan manevi miras
                </p>
              </div>
            </div>
          </div>

          <nav aria-label="Ana Bölümler" className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 rounded-xl border border-slate-200/90 dark:border-gray-800/90 bg-white/90 dark:bg-gray-900/40 px-1.5 py-2 sm:px-2.5 sm:py-2 shadow-2xs hover:shadow-sm dark:shadow-none transition-all duration-200 hover:-translate-y-0.5 ${card.border}`}
              >
                <div className={`flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${card.accent}`}>
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-between gap-0.5">
                    <h2 className="truncate text-[10px] sm:text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {card.title}
                    </h2>
                    <ArrowUpRight className="hidden md:block h-3 w-3 shrink-0 text-slate-400 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="hidden md:block truncate text-[10px] text-slate-500 dark:text-gray-400 leading-tight">
                    {card.desc}
                  </p>
                </div>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ANA İÇERİK: CANLI NAMAZ VAKİTLERİ VE İMSAKİYE */}
      <NamazVaktiClient initial={initial} initialLists={lists} defaultId={DEFAULT_ID} />
    </div>
  );
}

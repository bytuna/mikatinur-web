"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Risale-i Nur kütüphane ve okuma sayfaları dışındaki sayfalarda
 * KVKK Aydınlatma Metni ve Yasal Künye alt bilgisini gösterir.
 */
export function SiteFooter() {
  const pathname = usePathname();

  if (pathname?.startsWith("/projects/risaleinur")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 dark:border-gray-900 bg-slate-100/80 dark:bg-[#050505] px-6 py-5 text-center text-xs text-slate-500 dark:text-gray-600 transition-colors">
      <Link href="/kvkk-aydinlatma-metni" className="transition-colors hover:text-slate-900 dark:hover:text-gray-300">
        KVKK Aydınlatma Metni ve Yasal Künye
      </Link>
    </footer>
  );
}

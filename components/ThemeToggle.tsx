"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "mikatinur_site_theme";

export function ThemeToggle() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const isDark = saved === "dark";
      setTheme(isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
    } catch {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const isDark = next === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new CustomEvent("mikatinur-theme-change", { detail: next }));
    } catch {
      /* depolama erişimi kısıtlıysa sessizce devam et */
    }
  };

  // Risale-i Nur okuyucusunda sekme/ayar barıyla çakışmaması için hafif aşağıda konumlandırılır
  const isRisale = pathname?.startsWith("/projects/risaleinur");

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Gündüz moduna geç" : "Gece moduna geç"}
      title={isDark ? "Gündüz moduna geç" : "Gece moduna geç"}
      className={[
        isRisale
          ? "fixed bottom-5 right-5 z-50"
          : "fixed right-4 top-4 z-50 sm:right-6 sm:top-6",
        "group flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-all duration-300 cursor-pointer",
        "hover:scale-105 active:scale-95",
        isDark
          ? "border-gray-800 bg-gray-900/85 text-gray-100 shadow-black/40 hover:border-amber-400/50 hover:bg-gray-900"
          : "border-slate-200/90 bg-white/90 text-slate-800 shadow-slate-900/10 hover:border-amber-500/40 hover:bg-white",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-12",
          isDark
            ? "bg-indigo-500/20 text-indigo-300"
            : "bg-amber-500/15 text-amber-600",
        ].join(" ")}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      <span className="pr-1 tracking-wide">
        {isDark ? "Gece" : "Gündüz"}
      </span>
    </button>
  );
}

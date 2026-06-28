"use client";
import React from 'react';
import { UserPreferences, FontSize, FontStyle, ReadingTheme } from './types';
import { Sun, Moon, Eye, Type, AlignLeft, RefreshCw, HelpCircle } from 'lucide-react';

interface TefekkurSettingsProps {
  preferences: UserPreferences;
  onChange: (prefs: UserPreferences) => void;
  onReset: () => void;
}

export const TefekkurSettings: React.FC<TefekkurSettingsProps> = ({
  preferences,
  onChange,
  onReset,
}) => {
  const themes: { id: ReadingTheme; name: string; bg: string; text: string; border: string; desc: string }[] = [
    { id: 'light', name: 'Gündüz', bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200', desc: 'Sade ve berrak gündüz okuması' },
    { id: 'sepia', name: 'Tefekkür', bg: 'bg-sepia-100', text: 'text-sepia-900', border: 'border-sepia-300', desc: 'Gözü yormayan sıcak sepya tonu' },
    { id: 'dark', name: 'Gece', bg: 'bg-stone-900', text: 'text-stone-200', border: 'border-stone-800', desc: 'Loş ışıkta dinlendirici gece okuması' },
  ];

  const fontSizes: { id: FontSize; label: string; px: string }[] = [
    { id: 'sm', label: 'A-', px: 'text-sm' },
    { id: 'md', label: 'Varsayılan', px: 'text-base' },
    { id: 'lg', label: 'A+', px: 'text-lg' },
    { id: 'xl', label: 'A++', px: 'text-xl' },
    { id: '2xl', label: 'A+++', px: 'text-2xl' },
  ];

  const fontStyles: { id: FontStyle; name: string; class: string }[] = [
    { id: 'serif', name: 'EB Garamond (Serif)', class: 'font-serif' },
    { id: 'sans', name: 'Inter (Sans)', class: 'font-sans' },
  ];

  const lineHeights = [
    { id: 'tight', label: 'Dar', value: 'leading-snug' },
    { id: 'normal', label: 'Orta', value: 'leading-normal' },
    { id: 'relaxed', label: 'Rahat', value: 'leading-relaxed' },
    { id: 'loose', label: 'Geniş', value: 'leading-loose' },
  ];

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    onChange({
      ...preferences,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6 transition-all duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-sepia-300 dark:border-stone-850">
        <h3 className="text-xs font-serif font-extrabold uppercase tracking-[0.15em] text-[#2c2621] dark:text-amber-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-sepia-accent" />
          MÜTALAA VE TEFEKKÜR AYARLARI
        </h3>
        <button
          onClick={onReset}
          className="text-[10px] uppercase tracking-wider text-stone-400 hover:text-sepia-accent flex items-center gap-1 transition-colors font-sans font-bold cursor-pointer"
          title="Ayarları Sıfırla"
        >
          <RefreshCw className="w-3 h-3" /> Sıfırla
        </button>
      </div>

      {/* Tema Seçimi (Mütalaa Vakti) */}
      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-500 dark:text-stone-400">Mütalaa Vakti (Tema)</label>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updatePreference('theme', t.id)}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold font-sans cursor-pointer ${
                preferences.theme === t.id
                  ? 'border-sepia-accent bg-sepia-200/40 dark:bg-stone-800 text-sepia-accent ring-1 ring-sepia-accent/35 scale-[1.02]'
                  : 'border-sepia-300/40 dark:border-stone-850 bg-white/40 dark:bg-stone-900/40 hover:bg-sepia-200/20 dark:hover:bg-stone-850'
              } ${t.text}`}
              title={t.desc}
            >
              {t.id === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
              {t.id === 'sepia' && <Eye className="w-4 h-4 text-sepia-accent" />}
              {t.id === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Yazı Tipi (Yazı Hat Sanatı) */}
      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-500 dark:text-stone-400">Yazı Hat Tipi</label>
        <div className="grid grid-cols-2 gap-2">
          {fontStyles.map((f) => (
            <button
              key={f.id}
              onClick={() => updatePreference('fontStyle', f.id)}
              className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${f.class} ${
                preferences.fontStyle === f.id
                  ? 'border-sepia-accent bg-sepia-200/60 dark:bg-amber-950/20 text-[#2c2621] dark:text-amber-100 ring-1 ring-sepia-accent/35'
                  : 'border-sepia-300/40 dark:border-stone-850 bg-white/40 dark:bg-stone-900/40 hover:bg-sepia-200/20 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-350'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Harf Boyutu (Punto) */}
      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-500 dark:text-stone-400">Yazı Boyutu (Punto)</label>
        <div className="flex bg-sepia-200/30 dark:bg-stone-900/60 p-1 rounded-lg border border-sepia-300/40 dark:border-stone-850 justify-between gap-1">
          {fontSizes.map((fs) => (
            <button
              key={fs.id}
              onClick={() => updatePreference('fontSize', fs.id)}
              className={`flex-1 py-1.5 px-1 text-[10px] uppercase tracking-wider font-sans font-extrabold rounded transition-all cursor-pointer ${
                preferences.fontSize === fs.id
                  ? 'bg-sepia-accent text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Satır Aralığı (Satır Boşluğu) */}
      <div className="space-y-2">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-500 dark:text-stone-400">Satır Boşluğu</label>
        <div className="grid grid-cols-4 gap-1 bg-sepia-200/30 dark:bg-stone-900/60 p-1 rounded-lg border border-sepia-300/40 dark:border-stone-850 text-center">
          {lineHeights.map((lh) => (
            <button
              key={lh.id}
              onClick={() => updatePreference('lineHeight', lh.id as any)}
              className={`py-1.5 text-[10px] uppercase tracking-wider font-sans font-extrabold rounded transition-all cursor-pointer ${
                preferences.lineHeight === lh.id
                  ? 'bg-sepia-accent text-white shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
              }`}
            >
              {lh.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tefekkür Vurguları (Renk Aç / Kapa) */}
      <div className="flex items-center justify-between border-t border-sepia-300/40 dark:border-stone-850 pt-4">
        <span className="text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-500 dark:text-stone-400 flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sepia-accent animate-pulse" />
            Tefekkür Vurgusu
          </span>
          <span className="text-[9px] font-medium text-stone-400/85 dark:text-stone-500 lowercase">renkli analiz katmanı</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => updatePreference('showTefekkurHighlights', true)}
            className={`px-3 py-1.5 text-[10px] font-sans font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
              preferences.showTefekkurHighlights
                ? 'bg-sepia-accent text-white shadow-sm'
                : 'bg-stone-200/50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-700'
            }`}
          >
            Aç
          </button>
          <button
            onClick={() => updatePreference('showTefekkurHighlights', false)}
            className={`px-3 py-1.5 text-[10px] font-sans font-extrabold uppercase rounded-lg transition-all cursor-pointer ${
              !preferences.showTefekkurHighlights
                ? 'bg-stone-600 dark:bg-stone-700 text-white shadow-sm'
                : 'bg-stone-200/50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-stone-700'
            }`}
          >
            Kapat
          </button>
        </div>
      </div>

      {/* Haşiye (Footnotes) Göster / Gizle */}
      <div className="flex items-center justify-between border-t border-sepia-300/50 dark:border-stone-800/80 pt-4 mt-4">
        <span className="text-[10px] uppercase tracking-wider font-sans font-bold opacity-50 dark:text-stone-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" /> Haşiyeler
        </span>
        <button
          onClick={() => updatePreference('showFootnotes', !preferences.showFootnotes)}
          className={`w-10 h-5.5 flex items-center rounded-full p-0.5 transition-all duration-300 focus:outline-none cursor-pointer ${
            preferences.showFootnotes ? 'bg-sepia-accent' : 'bg-stone-300 dark:bg-stone-700'
          }`}
        >
          <div
            className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300 ${
              preferences.showFootnotes ? 'translate-x-4.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

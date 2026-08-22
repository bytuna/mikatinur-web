import React from 'react';
import { UserPreferences, FontSize, FontStyle, ReadingTheme, ArabicFont, UserNote } from '../types';
import { Sun, Moon, Type, AlignLeft, RefreshCw, HelpCircle, Palette, Download, Upload, Settings } from 'lucide-react';

interface TefekkurSettingsProps {
  preferences: UserPreferences;
  onChange: (prefs: UserPreferences) => void;
  onReset: () => void;
  notes: UserNote[];
  onNotesChange: (notes: UserNote[]) => void;
}

export const TefekkurSettings: React.FC<TefekkurSettingsProps> = ({
  preferences,
  onChange,
  onReset,
  notes,
  onNotesChange,
}) => {
  const themes: { id: ReadingTheme; name: string; bg: string; text: string; border: string; desc: string; previewBg: string }[] = [
    { id: 'light', name: 'Gündüz', bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200', desc: 'Sade ve berrak klasik sayfa', previewBg: 'bg-[#fdfcf9] border-stone-300' },
    { id: 'sepia', name: 'Tefekkür', bg: 'bg-sepia-100', text: 'text-sepia-900', border: 'border-sepia-300', desc: 'Gözü yormayan sıcak sepya tonu', previewBg: 'bg-[#f5e9d3] border-[#d8ccb6]' },
    { id: 'saman', name: 'Saman Kağıdı', bg: 'bg-[#eee0bb]', text: 'text-[#332913]', border: 'border-[#d0c091]', desc: 'Geleneksel sarımsı sıcak saman kağıdı tonu', previewBg: 'bg-[#ebdcae] border-[#d0c091]' },
    { id: 'green', name: 'Göz Dostu', bg: 'bg-[#e9f2e9]', text: 'text-[#142918]', border: 'border-[#c3d1c3]', desc: 'Zihni dinlendiren huzurlu nane yeşili', previewBg: 'bg-[#e3eee3] border-[#c3d1c3]' },
    { id: 'gray', name: 'Kitap Kağıdı', bg: 'bg-[#eff2f4]', text: 'text-[#1e252b]', border: 'border-[#ccd2d7]', desc: 'Kaliteli mat serin kitap kağıdı tonu', previewBg: 'bg-[#e8ecef] border-[#ccd2d7]' },
    { id: 'dark', name: 'Gece', bg: 'bg-stone-900', text: 'text-stone-200', border: 'border-stone-800', desc: 'Loş ışıkta dinlendirici karanlık sayfa', previewBg: 'bg-[#1c1917] border-stone-800' },
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

  const arabicFonts: { id: ArabicFont; name: string; class: string; desc: string }[] = [
    { id: 'hamdullah', name: 'Şeyh Hamdullah', class: 'font-arabic-hamdullah', desc: 'Asil Osmanlı sülüs/nesih hattı' },
    { id: 'hasenat', name: 'Hasenat Nesih', class: 'font-arabic-hasenat', desc: 'Geleneksel okunaklı nesih hattı' },
    { id: 'uthmantaha', name: 'Osman Taha', class: 'font-arabic-uthmantaha', desc: 'Standart Medine Mushafı hattı' },
    { id: 'amiri', name: 'Amiri', class: 'font-arabic-amiri', desc: 'Klasik edebi matbaa hattı' },
    { id: 'scheherazade', name: 'Şehrizat', class: 'font-arabic-scheherazade', desc: 'Geniş geleneksel nesih' },
    { id: 'notonaskh', name: 'Noto Naskh', class: 'font-arabic-notonaskh', desc: 'Modern temiz nesih hattı' },
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

  const handleExportNotes = () => {
    if (notes.length === 0) {
      alert('Dışa aktarılacak hiç tefekkür notunuz bulunmuyor.');
      return;
    }
    try {
      const dataStr = JSON.stringify(notes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mikatinur-tefekkur-notlari-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Notlar dışa aktarılırken bir hata oluştu.');
    }
  };

  const handleImportNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = JSON.parse(text);

        if (!Array.isArray(imported)) {
          alert('Geçersiz dosya formatı. Notlar bir liste (array) şeklinde olmalıdır.');
          return;
        }

        const validNotes: UserNote[] = [];
        let skipped = 0;

        for (const item of imported) {
          if (item && typeof item === 'object' && item.id && item.text) {
            validNotes.push({
              id: String(item.id),
              text: String(item.text),
              createdAt: String(item.createdAt || new Date().toLocaleString('tr-TR')),
              reference: item.reference ? {
                bookId: String(item.reference.bookId || ''),
                bookTitle: String(item.reference.bookTitle || ''),
                page: Number(item.reference.page || 1),
              } : undefined,
            });
          } else {
            skipped++;
          }
        }

        if (validNotes.length === 0) {
          alert('Dosyada geçerli herhangi bir tefekkür notu bulunamadı.');
          return;
        }

        const existingIds = new Set(notes.map((n) => n.id));
        const mergedNotes = [...notes];
        let addedCount = 0;

        for (const note of validNotes) {
          if (!existingIds.has(note.id)) {
            mergedNotes.push(note);
            addedCount++;
          }
        }

        onNotesChange(mergedNotes);
        localStorage.setItem('mikatinur_notes', JSON.stringify(mergedNotes));

        alert(`İçe aktarma başarılı!\nEklenen yeni not: ${addedCount}\nMevcut olanlarla birleştirilen toplam not: ${mergedNotes.length}${skipped > 0 ? `\nHatalı/Atlanan satır: ${skipped}` : ''}`);
      } catch (err) {
        console.error(err);
        alert('Dosya okunurken veya ayrıştırılırken hata oluştu. Lütfen geçerli bir mikatinur JSON dosyası seçin.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#d9cdb8]/80 bg-gradient-to-b from-[#f9f4ee] via-[#f5efe7] to-[#efe4d6] p-4 shadow-[0_18px_40px_rgba(90,63,35,0.08)] transition-all duration-300 dark:from-stone-950 dark:via-stone-950 dark:to-stone-900 dark:border-stone-800/80">
      <div className="flex items-center justify-between rounded-xl border border-[#e4d9c7] bg-white/60 px-3 py-2.5 shadow-sm dark:border-stone-800 dark:bg-stone-900/60">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-700 dark:text-stone-200">
          <div className="p-1.5 rounded-full border border-[#d4b98d] bg-[#f8ead8] text-sepia-accent shadow-sm dark:border-stone-700 dark:bg-stone-800 dark:text-amber-300">
            <Settings className="w-4 h-4" />
          </div>
          <span>Ayarlar</span>
        </div>
        <button
          onClick={onReset}
          className="text-[10px] uppercase tracking-wider text-stone-500 hover:text-sepia-accent flex items-center gap-1 transition-colors font-sans font-bold cursor-pointer"
          title="Ayarları Sıfırla"
        >
          <RefreshCw className="w-3 h-3" /> Sıfırla
        </button>
      </div>

      {/* Tema Seçimi (Sayfa Renkleri ve Temalar) */}
      <div className="space-y-2.5 rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-sepia-accent" />
          RENKLER (TEMA)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => updatePreference('theme', t.id)}
              className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                preferences.theme === t.id
                  ? 'border-sepia-accent bg-sepia-200/40 dark:bg-[#1a1410] text-sepia-accent ring-1 ring-sepia-accent/35 scale-[1.01]'
                  : 'border-sepia-300/30 dark:border-stone-850 bg-white/30 dark:bg-stone-900/30 hover:bg-sepia-200/20 dark:hover:bg-stone-850'
              }`}
              title={t.desc}
            >
              <div className={`w-6 h-6 rounded-full border shadow-inner flex items-center justify-center transition-transform duration-300 ${t.previewBg} ${preferences.theme === t.id ? 'scale-110' : ''}`}>
                {preferences.theme === t.id && (
                  <div className={`w-2 h-2 rounded-full ${t.id === 'dark' ? 'bg-amber-400' : 'bg-sepia-accent'}`} />
                )}
              </div>
              <span className={`text-[10px] font-sans font-bold truncate max-w-full ${preferences.theme === t.id ? 'text-sepia-accent' : 'text-stone-600 dark:text-stone-300'}`}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Yazı Tipi (Yazı Hat Sanatı) */}
      <div className="space-y-2 rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-600 dark:text-stone-300">Yazı Hat Tipi</label>
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

      {/* Arapça Yazı Tipi (Arapça Hat Sanatı) */}
      <div className="space-y-2 rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-600 dark:text-stone-300">Arapça Hat Sanatı</label>
        <div className="grid grid-cols-2 gap-2">
          {arabicFonts.map((af) => (
            <button
              key={af.id}
              onClick={() => updatePreference('arabicFont', af.id)}
              className={`py-2.5 px-3 rounded-lg border text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                (preferences.arabicFont || 'hamdullah') === af.id
                  ? 'border-sepia-accent bg-sepia-200/60 dark:bg-amber-950/20 text-[#2c2621] dark:text-amber-100 ring-1 ring-sepia-accent/35 font-bold scale-[1.01]'
                  : 'border-sepia-300/40 dark:border-stone-850 bg-white/40 dark:bg-stone-900/40 hover:bg-sepia-200/20 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-350'
              }`}
              title={af.desc}
            >
              <span className="font-sans text-[11px] font-bold leading-tight">{af.name}</span>
              <span className={`text-[17px] leading-none text-[#ff0000] ${af.class}`}>بِسْمِ اللَّهِ</span>
            </button>
          ))}
        </div>
      </div>

      {/* Harf Boyutu (Punto) */}
      <div className="space-y-2 rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-600 dark:text-stone-300">Yazı Boyutu (Punto)</label>
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
      <div className="space-y-2 rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45">
        <label className="block text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-600 dark:text-stone-300">Satır Boşluğu</label>
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
      <div className="flex items-center justify-between rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45">
        <span className="text-[10px] uppercase tracking-[0.15em] font-sans font-bold text-stone-600 dark:text-stone-300 flex flex-col gap-0.5">
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
      <div className="flex items-center justify-between rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45">
        <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
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

      {/* Tefekkür Notları Yönetimi (İçe/Dışa Aktar) */}
      <div className="rounded-xl border border-[#e6d9c3] bg-white/55 p-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/45 space-y-3">
        <span className="block text-[10px] uppercase tracking-wider font-sans font-bold text-stone-600 dark:text-stone-300">
          TEFEKKÜR NOTLARI YÖNETİMİ
        </span>
        <div className="grid grid-cols-2 gap-2">
          {/* Dışa Aktar Butonu */}
          <button
            onClick={handleExportNotes}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-sepia-accent/30 bg-sepia-accent/5 hover:bg-sepia-accent/15 text-sepia-accent text-[11px] font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
            title="Tüm notlarınızı yedeklemek için JSON formatında bilgisayarınıza indirin."
          >
            <Download className="w-3.5 h-3.5" />
            Dışa Aktar
          </button>

          {/* İçe Aktar Butonu */}
          <label
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-600 dark:text-stone-300 text-[11px] font-sans font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center"
            title="Daha önce yedeklediğiniz tefekkür notları JSON dosyasını içeri aktarın."
          >
            <Upload className="w-3.5 h-3.5" />
            İçe Aktar
            <input
              type="file"
              accept=".json"
              onChange={handleImportNotes}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-[9px] text-stone-400 dark:text-stone-500 font-sans leading-relaxed text-center">
          Notlarınızı yedekleyebilir veya başka cihazlarla birleştirebilirsiniz.
        </p>
      </div>
    </div>
  );
};

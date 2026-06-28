"use client";
import React, { useState, useEffect } from 'react';
import { RisaleBook, ReadingState } from '../types';
import { BookOpen, Search, Bookmark, Compass, Award, ExternalLink } from 'lucide-react';

const DEFAULT_VECIZELER = [
  "\"Kâinat bir kitâb-ı kebirdir.\" - Sözler, 30. Söz",
  "\"İman hem nurdur, hem kuvvettir.\" - Sözler, 23. Söz",
  "\"Mana-yı harfiyle kâinata bakmak.\" - Sözler, 23. Söz",
  "\"Şu kâinat, bir kitab-ı samedanidir.\" - Sözler, 11. Söz",
  "\"Her bir mevcudun lisan-ı haliyle bir virdi vardır.\" - Sözler, 24. Söz",
  "\"Bismillahi'r-Rahmâni'r-Rahîm, her hayrın başıdır.\" - Sözler, 1. Söz",
  "\"Bu ders akıldan ziyade kalbe bakar.\" - Lem'alar, 14. Lem'a",
  "\"Kâinatın gayesi, Hâlık-ı Zülcelâlin esmasını okumaktır.\" - Sözler, 20. Söz",
  "\"İman, insanı insan eder.\" - Sözler, 23. Söz",
  "\"Gözünü kapayan yalnız kendine gece yapar.\" - Sözler, 12. Söz",
  "\"Güzel gören güzel düşünür, güzel düşünen hayatından lezzet alır.\" - Mektubat, 26. Mektup",
  "\"Her kıştan sonra bir bahar vardır.\" - Sözler, 20. Söz",
  "\"Muhabbet, şu kâinatın bir sebeb-i vücududur.\" - Sözler, 32. Söz",
  "\"Kâinatın en büyük hakikati, tevhid hakikatidir.\" - Sözler, 22. Söz",
  "\"Bütün mevcudat, bir tek Allah'ın varlığına şahittir.\" - Sözler, 33. Söz",
  "\"İlim, marifettir.\" - Mesnevi-i Nuriye, Hubab",
  "\"Tefekkür, ibadettir.\" - Mesnevi-i Nuriye, Zerre",
  "\"Zevk-i ruhanî, iman nurundandır.\" - Mektubat, 26. Mektup",
  "\"Kâinat bir saraydır, Allah'ın esmasını gösterir.\" - Sözler, 24. Söz",
  "\"Her bir zerre, bir mühendisin sanatıdır.\" - Sözler, 32. Söz",
  "\"İman, bütün kâinatı bir sofra yapar.\" - Sözler, 23. Söz",
  "\"Hakikat arayanlara, hakikat her yerde hazır.\" - Mektubat, 29. Mektup"
];

interface LibraryViewProps {
  books: RisaleBook[];
  readingState: ReadingState;
  onSelectBook: (bookId: string, pageNumber?: number) => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  readingState,
  onSelectBook,
  theme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [vecizeler, setVecizeler] = useState<string[]>(DEFAULT_VECIZELER);
  const [vecizeIndex, setVecizeIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Dosyadan vecizeleri yükleme
  useEffect(() => {
    fetch('/vecizeler.txt')
      .then((res) => {
        if (res.ok) return res.text();
        throw new Error('Vecizeler dosyası bulunamadı, varsayılanlar kullanılacak.');
      })
      .then((text) => {
        const lines = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        if (lines.length > 0) {
          setVecizeler(lines);
        }
      })
      .catch((err) => {
        console.warn(err.message);
      });
  }, []);

  // 10 saniyede bir vecize değiştirme
  useEffect(() => {
    if (vecizeler.length === 0) return;
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setVecizeIndex((prev) => (prev + 1) % vecizeler.length);
        setFade(true);
      }, 500); // fade out animasyonu için yarım saniye bekle
    }, 10000); // 10 saniyede bir değişir
    return () => clearInterval(interval);
  }, [vecizeler]);

  // Kitap filtreleme
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Her kitap için son okunan sayfayı veya yer imini bulma
  const getBookBadge = (bookId: string) => {
    // Önce o kitabın yer imlerine bak
    const bookBookmarks = readingState.bookmarks.filter((b) => b.bookId === bookId);
    if (bookBookmarks.length > 0) {
      // En son eklenen yer imini al
      return { page: bookBookmarks[bookBookmarks.length - 1].page, type: 'bookmark' };
    }
    
    // Eğer şu an aktif kitap ise aktif sayfayı göster
    if (readingState.currentBookId === bookId) {
      return { page: readingState.currentPage, type: 'progress' };
    }

    return null;
  };

  // Dinamik Tasarım Değerleri
  const bgClass =
    theme === 'dark'
      ? 'bg-[#0c0a09]'
      : theme === 'sepia'
      ? 'bg-[#f5f2ed]'
      : 'bg-[#fafaf9]';

  const textClass =
    theme === 'dark'
      ? 'text-stone-200'
      : theme === 'sepia'
      ? 'text-[#2c2621]'
      : 'text-stone-900';

  const subtextClass =
    theme === 'dark'
      ? 'text-stone-400'
      : theme === 'sepia'
      ? 'text-[#5c5045]'
      : 'text-stone-500';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col transition-colors duration-300 overflow-y-auto no-scrollbar pb-16`}>
      {/* Üst Zarif Header */}
      <header className="border-b border-sepia-300/60 dark:border-stone-900 bg-white/40 dark:bg-stone-950/40 backdrop-blur-md px-6 py-4 sm:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sepia-accent/15 flex items-center justify-center border border-sepia-accent/30 shadow-xs">
            <Compass className="w-5 h-5 text-sepia-accent" />
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-2xl tracking-tight text-sepia-accent tracking-wide">
              Risale-i Nur
            </h1>
            <p className="text-[10px] font-sans font-bold tracking-widest text-stone-400 dark:text-stone-500 uppercase">
              Risale-i Nur Külliyatı Okuma ve Mütalaa Platformu
            </p>
          </div>
        </div>

        {/* Canlı Arama Kutusu ve Eylemler */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Kütüphanede kitap ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-sans font-medium rounded-full border border-sepia-300 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 focus:outline-none focus:ring-2 focus:ring-sepia-accent/20 focus:border-sepia-accent transition-all text-stone-800 dark:text-stone-200"
            />
          </div>
        </div>
      </header>

      {/* Ana Kütüphane Gövdesi */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 flex-1 w-full">
        {/* Tanıtım / Karşılama Kartı */}
        <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
          <h2 className="font-rln text-red-700 dark:text-red-500 text-3xl sm:text-4xl md:text-5xl tracking-wide font-normal">
            Risale-i Nur Külliyatı
          </h2>
          <div className="min-h-[70px] flex items-center justify-center px-4">
            <p className={`text-sm sm:text-base font-serif italic text-stone-700 dark:text-stone-300 max-w-xl mx-auto leading-relaxed transition-all duration-500 ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              {vecizeler[vecizeIndex]}
            </p>
          </div>
          <div className="h-px w-24 bg-sepia-accent/30 mx-auto" />
        </div>

        {/* Kitap Grid Listesi - Görseldeki gibi 8 sütunlu zarif yapı veya esnek bento grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-white/30 dark:bg-stone-950/30 rounded-2xl border border-dashed border-sepia-300 dark:border-stone-900 p-8">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-sans font-medium text-stone-400">Aradığınız kriterde bir kitap bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
            {filteredBooks.map((book) => {
              const badge = getBookBadge(book.id);
              const hasImage = book.coverImage && !failedImages[book.id];
              const isImageLoaded = hasImage && loadedImages[book.id];
              
              return (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book.id, badge?.page)}
                  className="group flex flex-col items-center cursor-pointer relative"
                >
                  {/* Kitap Görseli / 3D Cilt Efekti */}
                  <div className={`relative w-36 h-52 sm:w-40 sm:h-56 rounded-r-lg shadow-[4px_6px_16px_rgba(0,0,0,0.35)] hover:shadow-[10px_16px_28px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between p-3 select-none ${
                    isImageLoaded 
                      ? 'bg-transparent border-l-0' 
                      : 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900 border-l-[6px] border-stone-900'
                  }`}>
                    
                    {/* Yüklenen Gerçek Kitap Kapak Resmi */}
                    {hasImage && (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                        onLoad={() => setLoadedImages((prev) => ({ ...prev, [book.id]: true }))}
                        onError={() => setFailedImages((prev) => ({ ...prev, [book.id]: true }))}
                        className={`absolute inset-0 w-full h-full object-cover rounded-r-xs z-0 transition-opacity duration-300 ${
                          isImageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    )}

                    {/* Kitap Sırtı Parlama ve Gölge Efekti (Resmin de üstünde durur, 3D hava verir) */}
                    <div className="absolute top-0 left-0 bottom-0 w-[8px] bg-gradient-to-r from-black/40 via-transparent to-white/10 z-10" />
                    <div className="absolute top-0 left-2 bottom-0 w-[1px] bg-white/20 z-10" />
                    
                    {/* Altın Yaldızlı Kenarlık (Resim olsa da olmasa da lükslük katar) */}
                    <div className="absolute inset-2 border border-amber-400/40 p-0.5 rounded-sm z-10 pointer-events-none">
                      <div className="w-full h-full border border-amber-400/50 rounded-xs" />
                    </div>

                    {/* Üst Kısım: Küçük Yaldızlı Yıldız / Motif (Yalnızca görsel yüklenmediyse gösterilir) */}
                    {!isImageLoaded && (
                      <div className="z-10 text-center pt-2">
                        <div className="text-[7px] text-amber-400/80 font-serif tracking-[0.3em] uppercase">
                          Külliyat-ı Nur
                        </div>
                      </div>
                    )}

                    {/* Orta Kısım: Kitap İsmi (Zarif Yaldızlı Tipografi - Yalnızca görsel yüklenmediyse gösterilir) */}
                    {!isImageLoaded && (
                      <div className="z-10 text-center flex-1 flex flex-col items-center justify-center px-2 py-4">
                        {/* Geleneksel Çiçeksi / Geometrik Altın Madalyon */}
                        <div className="w-8 h-8 rounded-full border border-amber-400/30 flex items-center justify-center mb-1 bg-amber-400/5">
                          <span className="text-amber-400 text-xs font-serif">❦</span>
                        </div>
                        
                        <h3 className="font-serif font-bold text-sm sm:text-base text-amber-100 text-center leading-snug tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                          {book.title}
                        </h3>
                        
                        <div className="w-10 h-[1px] bg-amber-400/40 my-1" />
                      </div>
                    )}

                    {/* Alt Kısım: Müellif İsmi (Yalnızca görsel yüklenmediyse gösterilir) */}
                    {!isImageLoaded && (
                      <div className="z-10 text-center pb-1">
                        <span className="text-[6px] text-amber-400/60 font-serif uppercase tracking-widest">
                          Said Nursî
                        </span>
                      </div>
                    )}

                    {/* S.8 gibi Yeşil/Lila Badge (Görseldeki Gibi!) */}
                    {badge && (
                      <div className="absolute top-3 right-3 z-20 bg-[#4d7c0f] text-white text-[8px] font-mono font-bold py-0.5 px-1.5 rounded-sm shadow-md animate-fade-in border border-lime-300/30">
                        s.{badge.page}
                      </div>
                    )}
                  </div>

                  {/* Kitap İsmi Alt Etiket */}
                  <span className="mt-4 font-serif font-semibold text-xs text-center group-hover:text-sepia-accent transition-colors duration-200">
                    {book.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tanıtıcı Alt Footer */}
      <footer className="mt-auto py-8 border-t border-sepia-300/30 dark:border-stone-900 text-center">
        <p className="text-[10px] font-sans font-bold tracking-widest text-stone-400 uppercase">
          MikatiNur Projesi © {new Date().getFullYear()} — Her Hakkı Mahfuzdur.
        </p>
      </footer>
    </div>
  );
};

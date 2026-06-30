"use client";
import React, { useState, useEffect, useRef } from 'react';
import { RisaleBook, ReadingState } from '../types';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  Compass, 
  Award, 
  ExternalLink,
  XCircle,
  Loader2,
  Filter,
  Sparkles,
  Clock,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

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

// Diakritikleri temizleyip aramaya uygun hale getiren yardımcı fonksiyon (Said Nursî -> said nursi)
const normalizeForSearch = (str: string): string => {
  return str
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/û/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/['’`\-\.]/g, '') // Kesme işareti, tire ve noktaları temizle
    .replace(/\s+/g, ' ') // Boşlukları tekleştir
    .trim();
};

// Okuma kısımlarındaki kodları/özel karakterleri temizleme (Sayfa önizlemesi için)
const cleanTextForPreview = (text: string): string => {
  return text
    .replace(/\|\d+@/g, '') // |1@, |882@ gibi dipnot işaretlerini temizle
    .replace(/[\\[\]{}()<>~*&]/g, '') // \, &, >, <, ~ gibi biçimlendirme elemanlarını temizle
    .replace(/\s+/g, ' ') // Boşlukları düzenle
    .trim();
};

interface LibraryViewProps {
  books: RisaleBook[];
  readingState: ReadingState;
  onSelectBook: (bookId: string, pageNumber?: number, searchQuery?: string) => void;
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

  // Külliyat İçi Arama Durumları
  const [searchScope, setSearchScope] = useState<'titles' | 'corpus'>('titles');
  const [isSearchingCorpus, setIsSearchingCorpus] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentSearchingBook, setCurrentSearchingBook] = useState('');
  const [corpusSearchResults, setCorpusSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBookFilter, setSelectedBookFilter] = useState('all');
  const [visibleResultsCount, setVisibleResultsCount] = useState(20);

  const bookCache = useRef<Record<string, any>>({});
  const searchCanceledRef = useRef(false);

  // Külliyat İçi Arama İptal Fonksiyonu
  const cancelCorpusSearch = () => {
    searchCanceledRef.current = true;
    setIsSearchingCorpus(false);
  };

  // Külliyat İçi Arama Başlatıcı
  const handleCorpusSearch = async (queryToSearch: string) => {
    const trimmed = queryToSearch.trim();
    if (trimmed.length < 3) {
      alert("Lütfen arama yapmak için en az 3 karakter giriniz.");
      return;
    }

    setIsSearchingCorpus(true);
    setSearchProgress(0);
    setCorpusSearchResults([]);
    setHasSearched(true);
    searchCanceledRef.current = false;
    setSelectedBookFilter('all');
    setVisibleResultsCount(20);

    const normalizedQuery = normalizeForSearch(trimmed);

    for (let i = 0; i < books.length; i++) {
      if (searchCanceledRef.current) break;

      const book = books[i];
      setCurrentSearchingBook(book.title);
      setSearchProgress(Math.round((i / books.length) * 100));

      try {
        let bookData = bookCache.current[book.id];
        if (!bookData) {
          const response = await fetch(`/books/${book.id}.json`);
          if (response.ok) {
            bookData = await response.json();
            bookCache.current[book.id] = bookData;
          }
        }

        if (bookData && bookData.pages) {
          const bookResults: any[] = [];

          Object.entries(bookData.pages).forEach(([pageNumStr, val]) => {
            const pageObj = val as any;
            if (!pageObj || !pageObj.text) return;

            const rawText = pageObj.text;
            const cleanedText = cleanTextForPreview(rawText);
            const normalizedPageText = normalizeForSearch(cleanedText);

            let matchIdx = normalizedPageText.indexOf(normalizedQuery);
            const occurrences: number[] = [];

            while (matchIdx !== -1 && occurrences.length < 3) {
              occurrences.push(matchIdx);
              matchIdx = normalizedPageText.indexOf(normalizedQuery, matchIdx + normalizedQuery.length);
            }

            occurrences.forEach((idx) => {
              const start = Math.max(0, idx - 80);
              const end = Math.min(cleanedText.length, idx + normalizedQuery.length + 90);
              let snippet = cleanedText.substring(start, end);

              if (start > 0) snippet = '...' + snippet;
              if (end < cleanedText.length) snippet = snippet + '...';

              // Snippet içindeki yeni indeks ayarlaması
              const adjustedIdx = idx - start + (start > 0 ? 3 : 0);

              bookResults.push({
                id: `${book.id}-${pageNumStr}-${idx}`,
                bookId: book.id,
                bookTitle: book.title,
                pageNumber: parseInt(pageNumStr, 10),
                snippet: snippet,
                matchIndex: adjustedIdx,
                queryLength: normalizedQuery.length
              });
            });
          });

          if (bookResults.length > 0 && !searchCanceledRef.current) {
            setCorpusSearchResults(prev => [...prev, ...bookResults]);
          }
        }
      } catch (err) {
        console.error(`Error searching in book ${book.title}:`, err);
      }
    }

    if (!searchCanceledRef.current) {
      setSearchProgress(100);
    }
    setIsSearchingCorpus(false);
  };

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
      <header className="border-b border-sepia-300/60 dark:border-stone-900 bg-white/40 dark:bg-stone-950/40 backdrop-blur-md px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-sepia-accent/15 flex items-center justify-center border border-sepia-accent/30 shadow-xs shrink-0">
            <Compass className="w-4 h-4 md:w-5 md:h-5 text-sepia-accent" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-serif font-extrabold text-xl md:text-2xl tracking-tight text-sepia-accent">
              Risale-i Nur
            </h1>
            <p className="text-[9px] md:text-[10px] font-sans font-bold tracking-widest text-stone-400 dark:text-stone-500 uppercase">
              Risale-i Nur Külliyatı Okuma ve Mütalaa Platformu
            </p>
          </div>
        </div>

        {/* Canlı Arama Kutusu ve Eylemler */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end">
          {/* Arama Kapsamı Seçici */}
          <div className="flex bg-stone-200/50 dark:bg-stone-900/50 border border-sepia-300/30 dark:border-stone-800 p-0.5 rounded-full select-none text-[10px] font-sans font-bold uppercase tracking-wider w-full sm:w-auto justify-center shrink-0">
            <button
              onClick={() => {
                setSearchScope('titles');
                setHasSearched(false);
              }}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-full transition-all cursor-pointer text-center ${
                searchScope === 'titles'
                  ? 'bg-sepia-accent text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              📁 Kitap Adları
            </button>
            <button
              onClick={() => setSearchScope('corpus')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-full transition-all cursor-pointer text-center ${
                searchScope === 'corpus'
                  ? 'bg-sepia-accent text-stone-950 shadow-xs font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              🔍 Tüm Külliyat
            </button>
          </div>

          {/* Gelişmiş Giriş Alanı */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder={searchScope === 'corpus' ? "Külliyatta kelime ara (örn: ihlas)..." : "Kütüphanede kitap ara..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchScope === 'corpus') {
                      handleCorpusSearch(searchQuery);
                    }
                  }
                }}
                className="w-full pl-9 pr-8 py-2 text-xs font-sans font-medium rounded-full border border-sepia-300 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 focus:outline-none focus:ring-2 focus:ring-sepia-accent/20 focus:border-sepia-accent transition-all text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    if (searchScope === 'corpus') {
                      setHasSearched(false);
                      setCorpusSearchResults([]);
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchScope === 'corpus' && (
              <button
                onClick={() => handleCorpusSearch(searchQuery)}
                disabled={isSearchingCorpus || searchQuery.trim().length < 3}
                className={`px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-full transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  searchQuery.trim().length >= 3 && !isSearchingCorpus
                    ? 'bg-sepia-accent text-stone-950 hover:bg-sepia-accent/90 shadow-xs'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed'
                }`}
              >
                {isSearchingCorpus ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Ara
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Ana Gövde */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 flex-1 w-full">
        {searchScope === 'corpus' && (isSearchingCorpus || hasSearched) ? (
          /* ==========================================================
             KÜLLİYAT İÇİ DETAYLI ARAMA GÖRÜNÜMÜ
             ========================================================== */
          <div className="space-y-8 animate-fade-in">
            {/* Arama İlerleme / Yükleme Durumu */}
            {isSearchingCorpus && (
              <div className="p-6 rounded-2xl border border-amber-300/30 dark:border-stone-800 bg-amber-500/5 dark:bg-amber-950/10 backdrop-blur-xs flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-sepia-accent animate-spin" />
                    <div>
                      <h3 className="text-sm font-sans font-bold text-stone-800 dark:text-stone-200">
                        Külliyat Taranıyor...
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Şu an taranan kitap: <span className="font-serif font-bold text-sepia-accent">{currentSearchingBook}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={cancelCorpusSearch}
                    className="px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider text-red-500 hover:text-red-600 border border-red-500/30 hover:border-red-500/60 rounded-full transition-all cursor-pointer bg-white dark:bg-stone-950"
                  >
                    Aramayı Durdur
                  </button>
                </div>
                {/* İlerleme Çubuğu */}
                <div className="relative w-full h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-sepia-accent transition-all duration-300"
                    style={{ width: `${searchProgress}%` }}
                  />
                </div>
                <div className="text-right text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500">
                  %{searchProgress} tamamlandı
                </div>
              </div>
            )}

            {/* Arama Sonuç Başlığı */}
            {!isSearchingCorpus && hasSearched && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl border border-sepia-300/30 dark:border-stone-900 bg-white/40 dark:bg-stone-950/40 backdrop-blur-xs">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
                    "{searchQuery}" Arama Sonuçları
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Tüm külliyatta toplam <span className="font-sans font-bold text-sepia-accent">{corpusSearchResults.length}</span> eşleşme bulundu.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setCorpusSearchResults([]);
                    setSearchQuery('');
                  }}
                  className="px-4 py-1.5 text-xs font-sans font-bold uppercase tracking-wider border border-sepia-300 dark:border-stone-800 rounded-full transition-all hover:bg-sepia-accent hover:text-stone-950 cursor-pointer text-stone-600 dark:text-stone-300"
                >
                  Geri Dön / Sıfırla
                </button>
              </div>
            )}

            {/* Sonuçların Listelenmesi ve Sol Filtre Paneli */}
            {corpusSearchResults.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sol Filtre Paneli */}
                <div className="lg:col-span-1 space-y-3">
                  <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 flex items-center gap-2 px-1">
                    <Filter className="w-3.5 h-3.5 text-sepia-accent" />
                    Kitap Filtresi
                  </h4>
                  <div className="flex flex-wrap lg:flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedBookFilter('all');
                        setVisibleResultsCount(20);
                      }}
                      className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg text-left transition-all cursor-pointer flex items-center justify-between w-full ${
                        selectedBookFilter === 'all'
                          ? 'bg-sepia-accent text-stone-950 font-bold shadow-xs'
                          : 'bg-white/40 dark:bg-stone-950/40 hover:bg-white/80 dark:hover:bg-stone-950/80 text-stone-600 dark:text-stone-300 border border-sepia-300/20 dark:border-stone-800/40'
                      }`}
                    >
                      <span>Tüm Kitaplar</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-stone-500/10">
                        {corpusSearchResults.length}
                      </span>
                    </button>

                    {Object.entries(
                      corpusSearchResults.reduce((acc: Record<string, number>, curr) => {
                        acc[curr.bookId] = (acc[curr.bookId] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([bId, count]) => {
                      const bookObj = books.find((b) => b.id === bId);
                      const title = bookObj ? bookObj.title : bId;
                      return (
                        <button
                          key={bId}
                          onClick={() => {
                            setSelectedBookFilter(bId);
                            setVisibleResultsCount(20);
                          }}
                          className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg text-left transition-all cursor-pointer flex items-center justify-between w-full ${
                            selectedBookFilter === bId
                              ? 'bg-sepia-accent text-stone-950 font-bold shadow-xs'
                              : 'bg-white/40 dark:bg-stone-950/40 hover:bg-white/80 dark:hover:bg-stone-950/80 text-stone-600 dark:text-stone-300 border border-sepia-300/20 dark:border-stone-800/40'
                          }`}
                        >
                          <span className="truncate pr-2">{title}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-stone-500/10 shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sağ Sonuç Kartları */}
                <div className="lg:col-span-3 space-y-4">
                  {(() => {
                    const filteredResults = selectedBookFilter === 'all'
                      ? corpusSearchResults
                      : corpusSearchResults.filter((r) => r.bookId === selectedBookFilter);

                    const sliceResults = filteredResults.slice(0, visibleResultsCount);

                    if (filteredResults.length === 0) {
                      return (
                        <div className="text-center py-16 bg-white/20 dark:bg-stone-950/20 rounded-xl border border-dashed border-sepia-300/40 p-8">
                          <p className="text-sm text-stone-400">Bu filtrelenmiş kategoride sonuç bulunamadı.</p>
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="space-y-4">
                          {sliceResults.map((result) => {
                            const beforeMatch = result.snippet.substring(0, result.matchIndex);
                            const matchText = result.snippet.substring(result.matchIndex, result.matchIndex + result.queryLength);
                            const afterMatch = result.snippet.substring(result.matchIndex + result.queryLength);

                            return (
                              <div
                                key={result.id}
                                onClick={() => onSelectBook(result.bookId, result.pageNumber, searchQuery)}
                                className="p-5 rounded-xl border border-sepia-300/30 dark:border-stone-900 bg-white/50 dark:bg-stone-950/40 hover:bg-white/85 dark:hover:bg-stone-950/75 hover:scale-[1.005] hover:shadow-sm transition-all duration-300 cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
                              >
                                {/* Kart Sol Zarif Şerit */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sepia-accent via-amber-500 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Kart Başlık Çubuğu */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sepia-accent animate-pulse" />
                                    <h4 className="font-serif font-bold text-sm text-sepia-accent">
                                      {result.bookTitle}
                                    </h4>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 py-0.5 px-2 rounded border border-stone-200/40 dark:border-stone-800">
                                    s. {result.pageNumber}
                                    <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                </div>

                                {/* Sonuç Metni Önizlemesi */}
                                <p className="text-stone-700 dark:text-stone-300 font-serif leading-relaxed text-sm select-none">
                                  {beforeMatch}
                                  <mark className="bg-amber-100 dark:bg-amber-950/70 border-b-2 border-amber-500 text-stone-950 dark:text-amber-100 font-extrabold px-1 py-0.5 rounded-xs shadow-2xs mx-0.5">
                                    {matchText}
                                  </mark>
                                  {afterMatch}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Daha Fazla Göster Butonu */}
                        {filteredResults.length > visibleResultsCount && (
                          <div className="pt-4 text-center">
                            <button
                              onClick={() => setVisibleResultsCount((prev) => prev + 20)}
                              className="px-6 py-2.5 text-xs font-sans font-bold uppercase tracking-wider bg-white/60 dark:bg-stone-900/60 border border-sepia-300 dark:border-stone-800 hover:border-sepia-accent hover:bg-sepia-accent hover:text-stone-950 rounded-full transition-all inline-flex items-center gap-2 cursor-pointer text-stone-600 dark:text-stone-300"
                            >
                              Daha Fazla Sonuç Göster
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-stone-500/10">
                                {filteredResults.length - visibleResultsCount} kaldı
                              </span>
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Arama Yapıldı ve Hiç Sonuç Bulunamadıysa */}
            {!isSearchingCorpus && hasSearched && corpusSearchResults.length === 0 && (
              <div className="text-center py-24 bg-white/30 dark:bg-stone-950/30 rounded-2xl border border-dashed border-sepia-300 dark:border-stone-900 p-8 max-w-md mx-auto">
                <XCircle className="w-12 h-12 text-red-500/80 mx-auto mb-3" />
                <h4 className="font-serif font-bold text-base mb-1">Eşleşme Bulunamadı</h4>
                <p className="text-xs font-sans text-stone-500 dark:text-stone-400 leading-relaxed mb-4">
                  "{searchQuery}" ifadesi için külliyattaki 15 eserde hiçbir eşleşme bulunamadı. Lütfen kelimeyi kontrol edin veya farklı bir kavram arayın.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['ihlas', 'iman', 'tefekkür', 'acz'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        handleCorpusSearch(term);
                      }}
                      className="px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider rounded-full border border-sepia-300 dark:border-stone-800 text-sepia-accent hover:bg-sepia-accent hover:text-stone-950 transition-all cursor-pointer bg-white dark:bg-stone-950"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : searchScope === 'corpus' && !hasSearched ? (
          /* ==========================================================
             KÜLLİYAT İÇİ ARAMA GİRİŞ / HOŞ GELDİNİZ GÖRÜNÜMÜ
             ========================================================== */
          <div className="max-w-2xl mx-auto py-12 text-center space-y-8 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 shadow-xs">
              <Sparkles className="w-8 h-8 text-sepia-accent animate-pulse" />
            </div>
            <div className="space-y-3">
              <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-stone-800 dark:text-stone-100">
                Külliyat Kelime Arama Merkezi
              </h2>
              <p className="text-sm font-serif leading-relaxed text-stone-500 dark:text-stone-400">
                Risale-i Nur Külliyatı'ndaki 15 eserin (Sözler, Mektubat, Lem'alar, Şualar vb.) tamamında saniyeler içinde kelime veya cümle araması gerçekleştirebilirsiniz.
              </p>
            </div>

            {/* Popüler Kavramlar */}
            <div className="bg-white/40 dark:bg-stone-950/40 p-6 rounded-2xl border border-sepia-300/30 dark:border-stone-900 space-y-4">
              <h4 className="text-xs font-sans font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                Hızlı ve Popüler Kavramlar
              </h4>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'ihlas',
                  'tefekkür',
                  'iman',
                  'acz',
                  'fakr',
                  'haşir',
                  'besmele',
                  'uhuvvet',
                  'şükür',
                  'zikir',
                  'marifetullah'
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      handleCorpusSearch(term);
                    }}
                    className="px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider rounded-lg border border-sepia-300 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-sepia-accent hover:border-sepia-accent hover:text-stone-950 transition-all cursor-pointer bg-white/80 dark:bg-stone-950/80"
                  >
                    ❦ {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================================
             VARSAYILAN KÜTÜPHANE VE KİTAP LİSTESİ GÖRÜNÜMÜ
             ========================================================== */
          <>
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

            {/* Kitap Grid Listesi */}
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

                        {/* Kitap Sırtı Parlama ve Gölge Efekti */}
                        <div className="absolute top-0 left-0 bottom-0 w-[8px] bg-gradient-to-r from-black/40 via-transparent to-white/10 z-10" />
                        <div className="absolute top-0 left-2 bottom-0 w-[1px] bg-white/20 z-10" />

                        {/* Altın Yaldızlı Kenarlık */}
                        <div className="absolute inset-2 border border-amber-400/40 p-0.5 rounded-sm z-10 pointer-events-none">
                          <div className="w-full h-full border border-amber-400/50 rounded-xs" />
                        </div>

                        {/* Üst Kısım: Küçük Yaldızlı Yıldız / Motif */}
                        {!isImageLoaded && (
                          <div className="z-10 text-center pt-2">
                            <div className="text-[7px] text-amber-400/80 font-serif tracking-[0.3em] uppercase">
                              Külliyat-ı Nur
                            </div>
                          </div>
                        )}

                        {/* Orta Kısım: Kitap İsmi */}
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

                        {/* Alt Kısım: Müellif İsmi */}
                        {!isImageLoaded && (
                          <div className="z-10 text-center pb-1">
                            <span className="text-[6px] text-amber-400/60 font-serif uppercase tracking-widest">
                              Said Nursî
                            </span>
                          </div>
                        )}

                        {/* S.8 gibi Yeşil/Lila Badge */}
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
          </>
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

"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { RisaleBook, ReadingState, BookCategory } from '../types';
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  Award, 
  ExternalLink,
  XCircle,
  Loader2,
  Filter,
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  Compass,
  ChevronRight,
  ChevronDown,
  ChevronUp
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

const getNormalizedAndMapped = (str: string) => {
  let normalized = '';
  const indexMap: number[] = [];
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    // 1. Skip characters ignored by normalizeForSearch: ['’`\-\.]
    if (/['’`\-\.]/.test(char)) {
      continue;
    }
    
    // 2. Handle whitespace collapsing (multiple spaces -> single space)
    if (/\s/.test(char)) {
      if (normalized.length > 0 && normalized[normalized.length - 1] === ' ') {
        continue;
      }
      normalized += ' ';
      indexMap.push(i);
    } else {
      // 3. Normalize single non-space character (with Turkish and diacritic folding)
      let normChar = char.toLowerCase();
      if (char === 'İ') {
        normChar = 'i';
      } else if (char === 'I') {
        normChar = 'ı';
      }
      
      switch (normChar) {
        case 'â': normChar = 'a'; break;
        case 'î': normChar = 'i'; break;
        case 'û': normChar = 'u'; break;
        case 'ç': normChar = 'c'; break;
        case 'ğ': normChar = 'g'; break;
        case 'ı': normChar = 'i'; break;
        case 'i': normChar = 'i'; break;
        case 'ö': normChar = 'o'; break;
        case 'ş': normChar = 's'; break;
        case 'ü': normChar = 'u'; break;
        default: break;
      }
      normalized += normChar;
      indexMap.push(i);
    }
  }
  
  // Trim the normalized string and adjust map accordingly
  let startTrim = 0;
  while (startTrim < normalized.length && normalized[startTrim] === ' ') {
    startTrim++;
  }
  
  let endTrim = normalized.length;
  while (endTrim > startTrim && normalized[endTrim - 1] === ' ') {
    endTrim--;
  }
  
  const trimmedNormalized = normalized.substring(startTrim, endTrim);
  const trimmedMap = indexMap.slice(startTrim, endTrim);
  
  return { normalized: trimmedNormalized, indexMap: trimmedMap };
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
  const [coverStatus, setCoverStatus] = useState<Record<string, 'loading' | 'loaded' | 'failed'>>({});
  const [vecizeler, setVecizeler] = useState<string[]>(DEFAULT_VECIZELER);
  const [vecizeIndex, setVecizeIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Külliyat İçi Arama Durumları
  const [isSearchingCorpus, setIsSearchingCorpus] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [currentSearchingBook, setCurrentSearchingBook] = useState('');
  const [corpusSearchResults, setCorpusSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedBookFilter, setSelectedBookFilter] = useState('all');
  const [visibleResultsCount, setVisibleResultsCount] = useState(20);
  const [activeCategory, setActiveCategory] = useState<'all' | BookCategory>('all');
  const [expandedShelves, setExpandedShelves] = useState<Record<string, boolean>>({});
  const [rowLimit, setRowLimit] = useState<number>(6);

  useEffect(() => {
    const updateRowLimit = () => {
      const w = window.innerWidth;
      if (w >= 1280) setRowLimit(6);
      else if (w >= 1024) setRowLimit(5);
      else if (w >= 768) setRowLimit(4);
      else if (w >= 640) setRowLimit(3);
      else setRowLimit(2);
    };
    updateRowLimit();
    window.addEventListener('resize', updateRowLimit);
    return () => window.removeEventListener('resize', updateRowLimit);
  }, []);

  const toggleShelf = (id: string) => {
    setExpandedShelves((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const bookCache = useRef<Record<string, any>>({});
  const searchCanceledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    books.forEach((book) => {
      if (!book.coverImage) {
        setCoverStatus((prev) => (prev[book.id] === 'failed' ? prev : { ...prev, [book.id]: 'failed' }));
        return;
      }

      if (coverStatus[book.id] === 'loaded' || coverStatus[book.id] === 'failed') return;

      const img = new window.Image();
      img.decoding = 'async';
      img.onload = () => {
        setCoverStatus((prev) => ({ ...prev, [book.id]: 'loaded' }));
      };
      img.onerror = () => {
        setCoverStatus((prev) => ({ ...prev, [book.id]: 'failed' }));
      };
      img.src = book.coverImage;
      setCoverStatus((prev) => ({ ...prev, [book.id]: 'loading' }));
    });
  }, [books]);

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
            const { normalized: normalizedPageText, indexMap } = getNormalizedAndMapped(cleanedText);

            let matchIdx = normalizedPageText.indexOf(normalizedQuery);
            const occurrences: number[] = [];

            while (matchIdx !== -1 && occurrences.length < 3) {
              occurrences.push(matchIdx);
              matchIdx = normalizedPageText.indexOf(normalizedQuery, matchIdx + 1);
            }

            occurrences.forEach((mIdx) => {
              const trueStart = indexMap[mIdx];
              const trueEnd = indexMap[mIdx + normalizedQuery.length - 1] + 1;
              const matchLength = trueEnd - trueStart;

              const start = Math.max(0, trueStart - 80);
              const end = Math.min(cleanedText.length, trueEnd + 90);
              let snippet = cleanedText.substring(start, end);

              if (start > 0) snippet = '...' + snippet;
              if (end < cleanedText.length) snippet = snippet + '...';

              // Snippet içindeki tam indeks ayarlaması
              const adjustedIdx = trueStart - start + (start > 0 ? 3 : 0);

              bookResults.push({
                id: `${book.id}-${pageNumStr}-${mIdx}`,
                bookId: book.id,
                bookTitle: book.title,
                pageNumber: parseInt(pageNumStr, 10),
                snippet: snippet,
                matchIndex: adjustedIdx,
                matchLength: matchLength,
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

  const categorySections: { id: BookCategory; title: string; subtitle: string }[] = [
    {
      id: 'kulliyat',
      title: 'Risale-i Nur Külliyatı',
      subtitle: 'Bedîüzzaman Said Nursî Hazretlerinin 15 Ciltlik Asıl Nüsha Külliyatı',
    },
    {
      id: 'evrad',
      title: "Kur'an, Evrad ve Ezkâr",
      subtitle: "Kur'an-ı Kerîm, Cevşen-ül Kebîr, Hizb-ül Hakaik, Tesbihat ve Dualar",
    },
    {
      id: 'muhtelif',
      title: 'Muhtelif Eserler',
      subtitle: 'Esasat-ı Nuriye, Mufassal Tarihçe, İlmihal ve İslâmî Kaynak Eserler',
    },
    {
      id: 'kutub',
      title: 'Kütüb-i Sitte',
      subtitle: 'Prof. Dr. İbrahim Canan Tercüme ve Şerhi ile Hadis Külliyatı',
    },
  ];

  const groupedBooks = categorySections.map((section) => {
    const items = books.filter((book) => (book.category ?? 'kulliyat') === section.id);
    return { ...section, items };
  });

  const visibleSections =
    activeCategory === 'all'
      ? groupedBooks.filter((s) => s.items.length > 0)
      : groupedBooks.filter((s) => s.id === activeCategory && s.items.length > 0);

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} flex flex-col transition-colors duration-300 overflow-y-auto no-scrollbar pb-16`}>
      {/* Üst Zarif Header */}
      <header className="border-b border-sepia-300/60 dark:border-stone-900 bg-white/40 dark:bg-stone-950/40 backdrop-blur-md px-4 py-3 md:px-8 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="relative shrink-0 select-none">
            <img
              src="/risale-i-nur.jpg"
              alt="Risale-i Nur emblem"
              className="block w-14 h-14 md:w-20 md:h-20 object-cover rounded-full border border-[#7c4c2f]/70 shadow-[0_14px_24px_rgba(84,46,21,0.22)]"
            />
          </div>
          <div className="text-center md:text-left">
            <h1 className="font-rln uppercase text-xl md:text-2xl lg:text-[2rem] tracking-[0.12em] text-[#a31d1d] drop-shadow-[0_1px_0_rgba(96,69,38,0.18)]">
              Risale-i Nur
            </h1>
            <p className="text-[9px] md:text-[10px] font-sans font-bold tracking-widest text-stone-400 dark:text-stone-500 uppercase">
              Risale-i Nur Külliyatı Okuma ve Mütalaa Platformu
            </p>
          </div>
        </div>

        {/* Canlı Arama Kutusu ve Eylemler */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end">
          {/* Mîkāt-ı Nur Ana Sayfasına Dönüş Butonu */}
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2 rounded-full border border-[#a67c52]/60 dark:border-amber-500/40 bg-gradient-to-r from-[#f8f1e5] via-[#efe2cc] to-[#f8f1e5] dark:from-stone-900 dark:via-stone-800 dark:to-stone-900 px-4 py-2 text-xs font-serif font-semibold tracking-wide text-[#5c3a21] dark:text-amber-200 shadow-[0_4px_14px_rgba(124,76,47,0.15)] hover:shadow-[0_6px_20px_rgba(163,29,29,0.22)] hover:border-[#a31d1d]/70 dark:hover:border-amber-400 transition-all duration-300 hover:-translate-y-0.5 shrink-0"
            title="Mîkāt-ı Nur Ana Sayfasına Dön"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a31d1d]/10 dark:bg-amber-500/15 text-[#a31d1d] dark:text-amber-300 transition-transform duration-300 group-hover:-translate-x-0.5">
              <ArrowLeft className="w-3.5 h-3.5" />
            </span>
            <Compass className="w-3.5 h-3.5 text-[#a67c52] dark:text-amber-400 transition-transform duration-500 group-hover:rotate-45" />
            <span>Mîkāt-ı Nur&apos;a Dön</span>
          </Link>

          {/* Gelişmiş Giriş Alanı */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial sm:w-64 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Tüm külliyatta kelime veya cümle ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCorpusSearch(searchQuery);
                  }
                }}
                className="w-full pl-9 pr-8 py-2 text-xs font-sans font-medium rounded-full border border-sepia-300 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 focus:outline-none focus:ring-2 focus:ring-sepia-accent/20 focus:border-sepia-accent transition-all text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setHasSearched(false);
                    setCorpusSearchResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

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
          </div>
        </div>
      </header>

      {/* Ana Gövde */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 flex-1 w-full">
        {(isSearchingCorpus || hasSearched) ? (
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
                      className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg text-left transition-all cursor-pointer flex items-center justify-between w-full sm:w-auto lg:w-full gap-3 ${
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
                          className={`px-3 py-1.5 text-xs font-sans font-medium rounded-lg text-left transition-all cursor-pointer flex items-center justify-between w-full sm:w-auto lg:w-full gap-3 ${
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
                            const lengthToUse = result.matchLength || result.queryLength;
                            const beforeMatch = result.snippet.substring(0, result.matchIndex);
                            const matchText = result.snippet.substring(result.matchIndex, result.matchIndex + lengthToUse);
                            const afterMatch = result.snippet.substring(result.matchIndex + lengthToUse);

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
        ) : false ? (
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
                    {term}
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
            <div className="mb-12 text-center max-w-3xl mx-auto space-y-5">
              <h2 className="font-rln text-red-700 dark:text-red-500 text-3xl sm:text-4xl md:text-5xl tracking-wide font-normal">
                RİSALE-İ NUR
              </h2>

              <div className="relative overflow-hidden rounded-[22px] sm:rounded-[28px] border border-[#d9c5a6] bg-[linear-gradient(135deg,rgba(250,245,238,0.96),rgba(241,231,216,0.94),rgba(229,214,189,0.92))] shadow-[0_14px_28px_rgba(95,62,34,0.10)] px-3 py-3 sm:px-8 sm:py-6 dark:border-stone-800 dark:bg-[linear-gradient(135deg,rgba(27,22,18,0.96),rgba(23,19,17,0.96),rgba(17,15,14,0.96))]">
                <div className="absolute inset-x-4 sm:inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#b9966d]/80 to-transparent" />
                <div className="min-h-[42px] sm:min-h-[52px] flex items-center justify-center">
                  <p
                    className={`text-[12px] sm:text-sm md:text-lg font-serif italic max-w-2xl mx-auto leading-relaxed transition-all duration-500 font-medium tracking-[0.01em] text-[#1c1917] dark:text-stone-100 ${fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                  >
                    {vecizeler[vecizeIndex]}
                  </p>
                </div>
              </div>

              <div className="h-px w-24 bg-sepia-accent/30 mx-auto" />
            </div>

            {/* Kategori Filtre Sekmeleri */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-serif font-semibold tracking-wide transition-all cursor-pointer ${
                  activeCategory === 'all'
                    ? 'border-[#a31d1d]/70 bg-[#a31d1d] text-white shadow-[0_6px_18px_rgba(163,29,29,0.28)] dark:border-amber-400 dark:bg-amber-400 dark:text-stone-950'
                    : 'border-[#d8c4a6] bg-white/75 text-[#4f3824] hover:border-[#a67c52] hover:bg-[#f7efe3] dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:border-amber-500/40 dark:hover:text-amber-200'
                }`}
              >
                <span>Tümü</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${activeCategory === 'all' ? 'bg-white/20 text-white dark:bg-stone-950/20 dark:text-stone-950' : 'bg-stone-200/70 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                  {books.length}
                </span>
              </button>

              {groupedBooks.map((sec) => {
                const isActive = activeCategory === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveCategory(sec.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-serif font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'border-[#a31d1d]/70 bg-[#a31d1d] text-white shadow-[0_6px_18px_rgba(163,29,29,0.28)] dark:border-amber-400 dark:bg-amber-400 dark:text-stone-950'
                        : 'border-[#d8c4a6] bg-white/75 text-[#4f3824] hover:border-[#a67c52] hover:bg-[#f7efe3] dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:border-amber-500/40 dark:hover:text-amber-200'
                    }`}
                  >
                    <span>{sec.title}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${isActive ? 'bg-white/20 text-white dark:bg-stone-950/20 dark:text-stone-950' : 'bg-stone-200/70 text-stone-600 dark:bg-stone-800 dark:text-stone-400'}`}>
                      {sec.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Kitap Rafları ve Grid Listesi */}
            {books.length === 0 ? (
              <div className="text-center py-20 bg-white/30 dark:bg-stone-950/30 rounded-2xl border border-dashed border-sepia-300 dark:border-stone-900 p-8">
                <BookOpen className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-sans font-medium text-stone-400">Aradığınız kriterde bir kitap bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-14">
                {visibleSections.map((section) => {
                  const isExpanded = Boolean(expandedShelves[section.id]);
                  const hasMore = section.items.length > rowLimit;
                  const displayedItems = isExpanded ? section.items : section.items.slice(0, rowLimit);
                  const remainingCount = Math.max(0, section.items.length - rowLimit);

                  return (
                  <section key={section.id} className="space-y-7">
                    {/* Raf / Kategori Başlığı */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#d9c5a6]/80 dark:border-stone-800/90 pb-3.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#2e1e12] dark:text-amber-100">
                            {section.title}
                          </h3>
                        </div>
                        <p className={`mt-1 text-xs sm:text-sm font-serif italic ${subtextClass}`}>
                          {section.subtitle}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cfa97e]/50 bg-[#f6ead7]/80 dark:border-amber-500/25 dark:bg-amber-500/10 px-3 py-1 text-[11px] font-sans font-semibold text-[#6b4423] dark:text-amber-300">
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{section.items.length} Eser</span>
                        </span>

                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => toggleShelf(section.id)}
                            aria-expanded={isExpanded}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#a31d1d]/35 bg-[#a31d1d]/10 hover:bg-[#a31d1d] text-[#8b1818] hover:text-white dark:border-amber-400/40 dark:bg-amber-500/15 dark:text-amber-200 dark:hover:bg-amber-400 dark:hover:text-stone-950 px-3.5 py-1 text-[11px] font-sans font-bold tracking-wide transition-all cursor-pointer shadow-xs"
                          >
                            {isExpanded ? (
                              <>
                                <span>Daralt</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>Tümünü Gör (+{remainingCount})</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                      {displayedItems.map((book) => {
                        const badge = getBookBadge(book.id);
                        const coverState = coverStatus[book.id] ?? 'loading';
                        const hasImage = Boolean(book.coverImage) && coverState !== 'failed';
                        const isImageLoaded = coverState === 'loaded';

                        return (
                          <div
                            key={book.id}
                            onClick={() => onSelectBook(book.id, badge?.page)}
                            className="group flex flex-col items-center cursor-pointer relative"
                          >
                            {/* Kitap Görseli / 3D Cilt Efekti */}
                            <div className={`relative w-36 h-52 sm:w-40 sm:h-56 rounded-r-lg shadow-[4px_6px_16px_rgba(0,0,0,0.35)] hover:shadow-[10px_16px_28px_rgba(0,0,0,0.5)] group-hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col justify-between select-none ${
                              isImageLoaded
                                ? 'bg-transparent border-l-0 p-0'
                                : 'bg-gradient-to-br from-stone-800 via-stone-700 to-stone-900 border-l-[6px] border-stone-900 p-3'
                            }`}>

                              {/* Yüklenen Gerçek Kitap Kapak Resmi */}
                              {hasImage && (
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  referrerPolicy="no-referrer"
                                  onLoad={() => setCoverStatus((prev) => ({ ...prev, [book.id]: 'loaded' }))}
                                  onError={() => setCoverStatus((prev) => ({ ...prev, [book.id]: 'failed' }))}
                                  className="absolute inset-0 w-full h-full object-cover rounded-r-xs z-0 opacity-100 transition-opacity duration-300"
                                />
                              )}

                              {/* Kitap Sırtı Parlama ve Gölge Efekti */}
                              <div className="absolute top-0 left-0 bottom-0 w-[8px] bg-gradient-to-r from-black/40 via-transparent to-white/10 z-10" />
                              <div className="absolute top-0 left-2 bottom-0 w-[1px] bg-white/20 z-10" />

                              {/* Altın Yaldızlı Kenarlık */}
                              {!isImageLoaded && (
                                <div className="absolute inset-2 border border-amber-400/40 p-0.5 rounded-sm z-10 pointer-events-none">
                                  <div className="w-full h-full border border-amber-400/50 rounded-xs" />
                                </div>
                              )}

                              {/* Üst Kısım: Küçük Yaldızlı Yıldız / Motif */}
                              {!isImageLoaded && (
                                <div className="z-10 text-center pt-2">
                                  <div className="text-[7px] text-amber-400/80 font-serif tracking-[0.3em] uppercase">
                                    MÎKĀT-I NUR
                                  </div>
                                </div>
                              )}

                              {/* Orta Kısım: Kitap İsmi */}
                              {!isImageLoaded && (
                                <div className="z-10 text-center flex-1 flex flex-col items-center justify-center px-2 py-4">
                                  <div className="w-8 h-8 rounded-full border border-amber-400/30 flex items-center justify-center mb-1 bg-amber-400/5">
                                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
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
                                  <span className="text-[6px] text-amber-400/60 font-serif uppercase tracking-widest line-clamp-1">
                                    {book.author}
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
                            <span className="mt-4 font-serif font-semibold text-xs text-center group-hover:text-sepia-accent transition-colors duration-200 line-clamp-2 max-w-[10rem]">
                              {book.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <section className="mt-14 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-stone-300/70 dark:border-stone-800/80 bg-white/75 dark:bg-stone-900/50 backdrop-blur-sm p-6 sm:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-amber-800 dark:text-amber-300">
              <span>Emirdağ Lâhikası I, s. 49</span>
            </div>
            <p className="text-base sm:text-lg leading-relaxed text-stone-800 dark:text-stone-100 font-serif italic">
              “Risale-i Nur, Kur&apos;ân&apos;ın malıdır. Benim ne haddim var ki, sahib olayım; tâ ki kusurlarım ona sirayet etsin. Belki o Nur&apos;un kusurlu bir hâdimi ve o elmas mücevherat dükkânının bir dellâlıyım.”
            </p>
          </div>

          <div className="rounded-3xl border border-stone-300/70 dark:border-stone-800/80 bg-gradient-to-br from-stone-100 via-white to-stone-50 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900 backdrop-blur-sm p-6 sm:p-7 shadow-[0_12px_30px_rgba(0,0,0,0.06)]">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-[0.18em] text-emerald-800 dark:text-emerald-300">
                <Award className="w-3.5 h-3.5" />
                <span>İkinci Mektub, s. 13 • İstiğna Düsturu</span>
              </span>
            </div>
            <p className="text-sm sm:text-base leading-7 text-stone-700 dark:text-stone-200 font-serif">
              “Neşr-i hak için Enbiyaya ittiba&apos; etmekle mükellefiz. Kur&apos;an-ı Hakîm&apos;de, hakkı neşredenler: <span className="italic font-semibold text-emerald-900 dark:text-emerald-300">«İn ecrîye illâ alâllâh» (Benim ücretim ancak Allah&apos;a aittir)</span> diyerek insanlardan istiğna göstermişler.” Bu düstura binaen Mîkāt-ı Nur platformunda <span className="font-semibold text-stone-900 dark:text-stone-50">hiçbir şekilde ücret, abonelik, bağış veya reklam geliri alınmaz ve alınmayacaktır</span>; sırf Allah rızası için ücretsiz sunulur.
            </p>
          </div>
        </div>

        {/* Asıl Nüsha Metin Kaynağı ve Künye Kartı */}
        <div className="mt-6 relative overflow-hidden rounded-3xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-r from-amber-50/90 via-white/95 to-emerald-50/70 dark:from-stone-900/90 dark:via-stone-950/95 dark:to-stone-900/90 backdrop-blur-sm p-6 sm:p-8 shadow-[0_14px_34px_rgba(0,0,0,0.07)]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-500/10 px-3.5 py-1 text-[10px] font-sans font-bold uppercase tracking-[0.16em] text-amber-800 dark:text-amber-300">
                <BookOpen className="w-3.5 h-3.5" />
                Asıl Nüsha Kaynağı &amp; Künye
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-600/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-sans font-semibold tracking-wider text-emerald-800 dark:text-emerald-300">
                Hizmet Vakfı / Envâr Neşriyat
              </span>
              <span className="inline-flex items-center rounded-full border border-stone-400/30 bg-stone-500/10 px-3 py-1 text-[10px] font-sans font-medium tracking-wider text-stone-700 dark:text-stone-300">
                %100 Tahrifatsız &amp; Tamamen Ücretsiz Hizmet
              </span>
            </div>
          </div>

          <p className="text-sm sm:text-base leading-relaxed text-stone-800 dark:text-stone-200 font-serif">
            Mîkāt-ı Nur dijital kütüphanesinde yer alan 15 ciltlik Risale-i Nur Külliyatı metinlerinde ve sayfa düzeninde (mizanpaj numaralarında); Müellif-i Muhterem <span className="font-semibold text-stone-900 dark:text-white">Bedîüzzaman Said Nursî</span> Hazretlerinin sağlığında (1956–1960) bizzat tashihinden geçen nüshaları esas alan <span className="font-semibold text-amber-900 dark:text-amber-300">Hizmet Vakfı ve Envâr Neşriyat</span> asıl nüsha baskısı esas alınmıştır. Metinlerin orijinal imlâsına, kelimelerine ve âyet/hadis ibarelerine hiçbir surette müdahale edilmemekte; kelime mealleri yalnızca kelime üzerine dokunulduğunda açılan interaktif Osmanlıca-Türkçe lügat penceresiyle sunulmaktadır. Hakâik-i îmaniye hiçbir dünyevî menfaate âlet edilmez; web sitemizde ve mobil uygulamamızda <span className="font-semibold text-stone-900 dark:text-white">hiçbir şekilde ücret talep edilmez</span>.
          </p>
        </div>
      </section>

      {/* Tanıtıcı Alt Footer */}
      <footer className="mt-auto py-8 border-t border-sepia-300/30 dark:border-stone-900 text-center px-4">
        <p className="text-[10px] font-sans font-bold tracking-widest text-stone-500 dark:text-stone-400 uppercase">
          Mîkāt-ı Nur Projesi © {new Date().getFullYear()} • Metin Kaynağı: Hizmet Vakfı / Envâr Neşriyat Asıl Nüsha Baskısı
        </p>
      </footer>
    </div>
  );
};

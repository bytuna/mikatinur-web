"use client";
import { useState, useEffect } from 'react';
import { UserPreferences } from '../../../types';
import { KULLIYAT, DICTIONARY } from '../../../kulliyat';

type ReadingTheme = 'sepia' | 'dark' | 'light';

type ReadingState = {
  currentBookId: string;
  currentPage: number;
  selectedWord: string | null;
  selectedWordDefinition: DictionaryTerm | null;
  searchQuery: string;
  bookmarks: Array<{ bookId: string; page: number; date: string; }>;
};

type DictionaryTerm = {
  word: string;
  definition: string;
  origin?: string;
};

type FihristItem = {
  id: string;
  title: string;
  page: number;
  level: number;
  children: FihristItem[];
  parentId?: string;
};

type TOCSection = {
  id: string;
  title: string;
  startPage: number;
};

import { Sidebar } from '../../../components/Sidebar';
import { ReadingView } from '../../../components/ReadingView';
import { TefekkurSettings } from '../../../components/TefekkurSettings';
import { LibraryView } from '../../../components/LibraryView';
import { Menu, Settings, Compass, Library } from 'lucide-react';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'sepia',
  fontSize: 'md',
  fontStyle: 'serif',
  lineHeight: 'relaxed',
  showFootnotes: true,
  showTefekkurHighlights: true, // "Renk Aç" modu varsayılan olarak aktif
};

const DEFAULT_STATE: ReadingState = {
  currentBookId: 'sozler',
  currentPage: 5,
  selectedWord: null,
  selectedWordDefinition: null,
  searchQuery: '',
  bookmarks: [
    { bookId: 'sozler', page: 5, date: '28.06.2026' }
  ],
};

const getFilePrefixForChar = (char: string): string | null => {
  if (!char) return null;
  const c = char.toLowerCase();
  if (c === 'ç') return 'c1';
  if (c === 'ı') return 'i1';
  if (c === 'ö') return 'o1';
  if (c === 'ş') return 's1';
  if (c === 'ü') return 'u1';
  if (c === 'ğ') return 'g';
  if (c >= 'a' && c <= 'z') return c;
  return null;
};

const parseRawDictionaryFile = (text: string): Record<string, DictionaryTerm> => {
  const dict: Record<string, DictionaryTerm> = {};
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const word = trimmed.substring(0, eqIdx).trim();
      const definition = trimmed.substring(eqIdx + 1).trim();
      if (word && definition) {
        const key = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '').trim();
        dict[key] = {
          word: word,
          definition: definition.replace(/<br>/g, '\n'),
          origin: 'Arapça'
        };
      }
    }
  }
  return dict;
};

const parseFihristText = (text: string): FihristItem[] => {
  const lines = text.split('\n');
  const items: FihristItem[] = [];
  const activeStack: FihristItem[] = [];

  lines.forEach((line, idx) => {
    let level = 0;
    while (line.startsWith('\t')) {
      level++;
      line = line.substring(1);
    }
    
    const trimmed = line.trim();
    if (!trimmed) return;

    // Split by '|'
    const parts = trimmed.split('|');
    let title = parts[0].trim();
    
    if (title.includes('@')) {
      title = title.split('@')[0].trim();
    }

    let page = 1;
    if (parts.length > 1) {
      const pagePart = parts[1].trim();
      const pctIdx = pagePart.indexOf('%');
      const pageStr = pctIdx !== -1 ? pagePart.substring(0, pctIdx) : pagePart;
      page = parseInt(pageStr, 10) || 1;
    }

    const item: FihristItem = {
      id: `fihrist-${idx}-${page}`,
      title,
      page,
      level,
      children: []
    };

    if (level === 0) {
      items.push(item);
      activeStack[0] = item;
    } else {
      const parent = activeStack[level - 1];
      if (parent) {
        parent.children.push(item);
        item.parentId = parent.id;
      } else {
        items.push(item);
      }
      activeStack[level] = item;
    }
  });

  return items;
};

const flattenFihrist = (items: FihristItem[]): TOCSection[] => {
  const flat: TOCSection[] = [];
  const traverse = (node: FihristItem) => {
    if (node.level > 0) {
      flat.push({
        id: node.id,
        title: node.title,
        startPage: node.page
      });
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse);
    }
  };
  items.forEach(traverse);
  return flat;
};

export default function App() {
  const [viewMode, setViewMode] = useState<'library' | 'reader'>('library');
  const [isHydrated, setIsHydrated] = useState(false);
  
  // LocalStorage Kalıcılık (State Persistence) - SSR Uyumlu Başlangıç Değerleri
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [state, setState] = useState<ReadingState>(DEFAULT_STATE);

  // Mount anında localStorage'dan verileri çek
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPrefs = localStorage.getItem('mikatinur_preferences');
      if (savedPrefs) {
        try {
          setPreferences(JSON.parse(savedPrefs));
        } catch (e) {
          console.error(e);
        }
      }

      const savedState = localStorage.getItem('mikatinur_reading_state');
      if (savedState) {
        try {
          setState(JSON.parse(savedState));
        } catch (e) {
          console.error(e);
        }
      }
      setIsHydrated(true);
    }
  
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fihristClickTrigger, setFihristClickTrigger] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dynamicBooks, setDynamicBooks] = useState<Record<string, {
    startingPage?: number;
    totalPages?: number;
    sections?: any[];
    pages: Record<number, any>;
  }>>({});
  const [isLoadingDynamic, setIsLoadingDynamic] = useState(false);

  // Fihrist yükleme ve ayrıştırma mantığı
  const [fihristNodes, setFihristNodes] = useState<FihristItem[]>([]);

  useEffect(() => {
    let active = true;
    const bookIdToFihristFile: Record<string, string> = {
      'sozler': 'sozlerf.txt',
      'mektubat': 'mektubatf.txt',
      'lemalar': 'lemalarf.txt',
      'sualar': 'sualarf.txt',
      'mesnevi': 'mesnevif.txt',
      'isarat-ul-icaz': 'isaratf.txt',
      'barla-lahikasi': 'barlaf.txt',
      'kastamonu-lahikasi': 'kastamonuf.txt',
      'emirdag-lahikasi-1': 'emirdag1f.txt',
      'emirdag-lahikasi-2': 'emirdag2f.txt',
      'sikke-i-tasdik-i-gaybi': 'stgaybf.txt',
      'tarihce-i-hayat': 'tarihcef.txt',
      'asa-yi-musa': 'asamusaf.txt',
      'iman-ve-kufur-muvazeneleri': 'imankufurf.txt',
      'muhakemat': 'muhakematf.txt'
    };

    const filename = bookIdToFihristFile[state.currentBookId];
    if (!filename) {
      setFihristNodes([]);
      return;
    }

    const loadFihrist = async () => {
      try {
        const response = await fetch(`/fihrist/${filename}`);
        if (!response.ok) {
          console.warn(`Fihrist file not found: ${filename}`);
          setFihristNodes([]);
          return;
        }
        const text = await response.text();
        if (active) {
          const parsed = parseFihristText(text);
          setFihristNodes(parsed);
          console.log(`Successfully loaded and parsed hierarchical fihrist with ${parsed.length} root items.`);
        }
      } catch (err) {
        console.warn(`Error loading fihrist for ${state.currentBookId}:`, err);
        setFihristNodes([]);
      }
    };

    loadFihrist();
    return () => {
      active = false;
    };
  }, [state.currentBookId]);

  // Dinamik Lügat (Dictionary) Yükleme ve Birleştirme
  const [dictionary, setDictionary] = useState<Record<string, DictionaryTerm>>(DICTIONARY);

  useEffect(() => {
    const loadCustomDictionary = async () => {
      try {
        const response = await fetch('/lugat/tr.json');
        if (!response.ok) {
          console.log('Custom dictionary tr.json not found, using default static DICTIONARY');
          return;
        }
        const data = await response.json();
        const loadedDict: Record<string, DictionaryTerm> = { ...DICTIONARY };

        if (Array.isArray(data)) {
          // Array of objects
          data.forEach((item: any) => {
            if (item && typeof item === 'object' && item.word) {
              const key = item.word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '').trim();
              loadedDict[key] = {
                word: item.word,
                definition: item.def || item.definition || item.meaning || '',
                origin: item.origin || 'Arapça'
              };
            }
          });
        } else if (typeof data === 'object' && data !== null) {
          // Map of objects or strings
          Object.entries(data).forEach(([key, value]) => {
            const cleanKey = key.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '').trim();
            if (typeof value === 'string') {
              loadedDict[cleanKey] = {
                word: key.charAt(0).toUpperCase() + key.slice(1),
                definition: value,
                origin: 'Arapça'
              };
            } else if (value && typeof value === 'object') {
              const valObj = value as any;
              loadedDict[cleanKey] = {
                word: valObj.word || key,
                definition: valObj.def || valObj.definition || valObj.meaning || '',
                origin: valObj.origin || valObj.lang || 'Arapça'
              };
            }
          });
        }

        setDictionary(loadedDict);
        console.log('Successfully loaded custom dictionary with', Object.keys(loadedDict).length, 'terms.');
      } catch (err) {
        console.warn('Error loading custom dictionary, fallback to default static DICTIONARY:', err);
      }
    };

    loadCustomDictionary();
  }, []);

  // Harf bazlı raw dosyalarını arka planda yükleme takibi
  const [loadedLetters, setLoadedLetters] = useState<Record<string, boolean>>({});

  // Belirli bir harf/önek dosyasını yükleyen fonksiyon
  const loadLetterDictionary = async (prefix: string) => {
    if (loadedLetters[prefix]) return;
    setLoadedLetters((prev) => ({ ...prev, [prefix]: true }));

    try {
      const response = await fetch(`/lugat/raw/${prefix}.a`);
      if (response.ok) {
        const text = await response.text();
        const parsed = parseRawDictionaryFile(text);
        setDictionary((prev) => {
          const next = { ...prev };
          Object.entries(parsed).forEach(([key, val]) => {
            if (!next[key] || next[key].definition.length < val.definition.length) {
              next[key] = val;
            }
          });
          return next;
        });
        console.log(`Arka planda '${prefix}' harfi lügat kayıtları başarıyla yüklendi.`);
      }
    } catch (err) {
      console.warn(`Harf dosyası yüklenirken hata oluştu (${prefix}):`, err);
    }
  };

  // 1. Aktif sayfadaki kelimelerin baş harflerini tarayıp lügati yükleme
  useEffect(() => {
    const activeBookObj = KULLIYAT.find((b) => b.id === state.currentBookId);
    const dynamicBook = dynamicBooks[state.currentBookId];
    const pageData = dynamicBook?.pages[state.currentPage] || activeBookObj?.pages[state.currentPage];
    
    if (!pageData || !pageData.text) return;

    // Kelimeleri ayırt edip ilk harflerini topla
    const words = pageData.text.split(/\s+/);
    const prefixesToLoad = new Set<string>();

    words.forEach((word: string) => {
      const cleaned = word.replace(/^[^a-zA-ZçğışöüÇĞİŞÖÜ]+/, '');
      if (cleaned.length > 0) {
        const prefix = getFilePrefixForChar(cleaned[0]);
        if (prefix) {
          prefixesToLoad.add(prefix);
        }
      }
    });

    prefixesToLoad.forEach((prefix) => {
      loadLetterDictionary(prefix);
    });
  }, [state.currentPage, state.currentBookId, dynamicBooks]);

  // 2. Lügat arama kelimesine göre dinamik harf yükleme
  useEffect(() => {
    if (!state.searchQuery) return;
    const cleaned = state.searchQuery.replace(/^[^a-zA-ZçğışöüÇĞİŞÖÜ]+/, '');
    if (cleaned.length > 0) {
      const prefix = getFilePrefixForChar(cleaned[0]);
      if (prefix) {
        loadLetterDictionary(prefix);
      }
    }
  }, [state.searchQuery]);

  // Dinamik kitap verilerini yükle (Örn: /books/sozler.json)
  useEffect(() => {
    let active = true;

    // Eğer kitap zaten yüklüyse tekrar çekme (hızlanma ve anında geçiş sağlar)
    if (dynamicBooks[state.currentBookId]) {
      return;
    }

    const fetchPages = async () => {
      setIsLoadingDynamic(true);
      try {
        // Cache bust the fetch query to avoid cached old files
        const response = await fetch(`/books/${state.currentBookId}.json?t=${refreshTrigger}`);
        if (response.ok) {
          const data = await response.json();
          if (active && data && data.pages) {
            const parsedPages: Record<number, any> = {};
            Object.entries(data.pages).forEach(([k, v]) => {
              parsedPages[parseInt(k, 10)] = v;
            });
            setDynamicBooks((prev) => ({
              ...prev,
              [state.currentBookId]: {
                startingPage: data.startingPage,
                totalPages: data.totalPages,
                sections: data.sections,
                pages: parsedPages,
              },
            }));
          }
        }
      } catch (err) {
        console.warn(`Dynamic pages fetch failed for ${state.currentBookId}. Fallback to static code pages.`);
      } finally {
        if (active) setIsLoadingDynamic(false);
      }
    };

    fetchPages();
    return () => {
      active = false;
    };
  }, [state.currentBookId, refreshTrigger]);

  // Tercihleri ve Okuma Durumunu Kaydet (Yalnızca yüklendikten sonra kaydet)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('mikatinur_preferences', JSON.stringify(preferences));
    }
  }, [preferences, isHydrated]);

  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('mikatinur_reading_state', JSON.stringify(state));
    }
  }, [state, isHydrated]);

  // Tema Yönetimi (Global Theme Context)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'bg-white', 'bg-sepia-100', 'bg-stone-950');
    
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = '#12100e'; 
    } else if (preferences.theme === 'sepia') {
      root.style.backgroundColor = '#d8ccb6'; 
    } else {
      root.style.backgroundColor = '#dfd4be'; // Saman kağıdı/parşömen uyumlu sıcak arka plan
    }
  }, [preferences.theme]);

  const staticBook = KULLIYAT.find((b) => b.id === state.currentBookId) || KULLIYAT[0];
  const dynamicBook = dynamicBooks[state.currentBookId];
  
  // Kitap sayfalarını birleştirip doğru sayfa sınırlarını dinamik olarak hesaplayalım (sayfa karışıklıklarını gider)
  const combinedPages = (dynamicBook && Object.keys(dynamicBook.pages).length > 0)
    ? dynamicBook.pages
    : staticBook.pages;

  const pageKeys = Object.keys(combinedPages).map(Number).filter(n => !isNaN(n));
  
  let bookStartingPage = staticBook.startingPage;
  let bookMaxPage = staticBook.startingPage + staticBook.totalPages - 1;

  if (state.currentBookId === 'mektubat' || state.currentBookId === 'lemalar') {
    bookStartingPage = 5;
    if (pageKeys.length > 0) {
      bookMaxPage = Math.max(...pageKeys);
    } else {
      bookMaxPage = 5 + staticBook.totalPages - 1;
    }
  } else if (pageKeys.length > 0) {
    bookStartingPage = Math.min(...pageKeys);
    bookMaxPage = Math.max(...pageKeys);
  }

  const bookTotalPages = bookMaxPage - bookStartingPage + 1;

  const parsedSections = fihristNodes.length > 0 ? flattenFihrist(fihristNodes) : (dynamicBook?.sections && dynamicBook.sections.length > 0 ? dynamicBook.sections : staticBook.sections);

  const activeBook = {
    ...staticBook,
    startingPage: bookStartingPage,
    totalPages: bookTotalPages,
    sections: parsedSections,
    pages: combinedPages,
  };

  // Dinamik olarak yüklenen kitabın sayfa sınırlarına göre aktif sayfayı düzeltme
  useEffect(() => {
    const minPage = activeBook.startingPage;
    const maxPage = minPage + activeBook.totalPages - 1;
    if (state.currentPage < minPage || state.currentPage > maxPage) {
      setState((prev) => ({
        ...prev,
        currentPage: minPage,
      }));
    }
  }, [activeBook.startingPage, activeBook.totalPages]);

  // Mobil & Tarayıcı Geri Tuşu ile Kütüphaneye Dönme Yönetimi (popstate)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (viewMode === 'reader') {
      if (window.history.state?.view !== 'reader') {
        window.history.pushState({ view: 'reader' }, '');
      }
    }

    const handlePopState = () => {
      if (viewMode === 'reader') {
        setViewMode('library');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [viewMode]);

  const handleSelectBook = (bookId: string, pageNumber?: number, searchQuery?: string) => {
    const book = KULLIYAT.find((b) => b.id === bookId) || KULLIYAT[0];
    const dynBook = dynamicBooks[bookId];
    
    // Kitap değişiminde doğru başlangıç sayfasını dinamik sayfa anahtarlarına göre hesaplayalım
    const combined = (dynBook && Object.keys(dynBook.pages).length > 0) ? dynBook.pages : book.pages;
    const pageKeys = Object.keys(combined).map(Number).filter(n => !isNaN(n));
    let minPage = book.startingPage;
    if (bookId === 'mektubat' || bookId === 'lemalar') {
      minPage = 5;
    } else if (pageKeys.length > 0) {
      minPage = Math.min(...pageKeys);
    } else if (dynBook?.startingPage !== undefined) {
      minPage = dynBook.startingPage;
    }
    
    let targetPage = pageNumber || minPage;
    if (targetPage < minPage) {
      targetPage = minPage;
    }
    
    setState((prev) => ({
      ...prev,
      currentBookId: bookId,
      currentPage: targetPage, // Kitap değişiminde kitap başlangıç sayfası veya belirtilen sayfa
      selectedWord: null,
      selectedWordDefinition: null,
      searchQuery: searchQuery !== undefined ? searchQuery : prev.searchQuery,
    }));
    setViewMode('reader');
    setSidebarOpen(true);
    setFihristClickTrigger(Date.now());
  };

  const handleSelectPage = (pageNumber: number, isFromFihrist = false) => {
    setState((prev) => ({
      ...prev,
      currentPage: pageNumber,
      selectedWord: null,
      selectedWordDefinition: null,
    }));
    if (isFromFihrist) {
      setFihristClickTrigger(Date.now());
    }
  };

  const handleSelectWord = (term: DictionaryTerm) => {
    setState((prev) => ({
      ...prev,
      selectedWord: term.word,
      selectedWordDefinition: term,
    }));
  };

  const handleSearchChange = (query: string) => {
    setState((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  };

  const handleToggleBookmark = (bookId: string, page: number) => {
    setState((prev) => {
      const isBookmarked = prev.bookmarks.some((b) => b.bookId === bookId && b.page === page);
      let nextBookmarks;
      
      if (isBookmarked) {
        nextBookmarks = prev.bookmarks.filter((b) => !(b.bookId === bookId && b.page === page));
      } else {
        nextBookmarks = [
          ...prev.bookmarks,
          { bookId, page, date: new Date().toLocaleDateString('tr-TR') },
        ];
      }

      return {
        ...prev,
        bookmarks: nextBookmarks,
      };
    });
  };

  const handleResetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const handleGoToLibrary = () => {
    if (viewMode === 'reader') {
      if (typeof window !== 'undefined' && window.history.state?.view === 'reader') {
        window.history.back();
      } else {
        setViewMode('library');
      }
    } else {
      setViewMode('library');
    }
  };

  // Temanın renk kombinasyonlarını dinamik belirleme
  const getThemeLayoutClasses = (theme: ReadingTheme) => {
    switch (theme) {
      case 'dark':
        return 'bg-[#181614] text-[#e7e5e4]';
      case 'sepia':
        return 'bg-[#f5f2ed] text-[#2c2621]';
      case 'light':
      default:
        return 'bg-[#fdfcf9] text-[#1c1917]';
    }
  };

  const booksWithDynamicData = KULLIYAT.map((book) => {
    const dynBook = dynamicBooks[book.id];
    const combinedPages = (dynBook && Object.keys(dynBook.pages).length > 0)
      ? dynBook.pages
      : book.pages;
    const pageKeys = Object.keys(combinedPages).map(Number).filter(n => !isNaN(n));
    
    let bookStartingPage = book.startingPage;
    let bookMaxPage = book.startingPage + book.totalPages - 1;

    if (book.id === 'mektubat' || book.id === 'lemalar') {
      bookStartingPage = 5;
      if (pageKeys.length > 0) {
        bookMaxPage = Math.max(...pageKeys);
      } else {
        bookMaxPage = 5 + book.totalPages - 1;
      }
    } else if (pageKeys.length > 0) {
      bookStartingPage = Math.min(...pageKeys);
      bookMaxPage = Math.max(...pageKeys);
    }

    const bookTotalPages = bookMaxPage - bookStartingPage + 1;

    return {
      ...book,
      startingPage: bookStartingPage,
      totalPages: bookTotalPages,
      sections: dynBook?.sections && dynBook.sections.length > 0 ? dynBook.sections : book.sections,
      pages: combinedPages,
    };
  });

  if (viewMode === 'library') {
    return (
      <LibraryView
        books={booksWithDynamicData}
        readingState={state}
        onSelectBook={handleSelectBook}
        theme={preferences.theme}
      />
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${getThemeLayoutClasses(preferences.theme)}`}>
      
      {/* Sol Sidebar (Fihrist & Arama & Lügat) */}
      <Sidebar
        books={booksWithDynamicData}
        fihristNodes={fihristNodes}
        state={state}
        onSelectBook={handleSelectBook}
        onSelectPage={handleSelectPage}
        onSearchChange={handleSearchChange}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(false)}
        onGoToLibrary={handleGoToLibrary}
        dictionary={dictionary}
        onSelectWord={handleSelectWord}
        theme={preferences.theme}
        preferences={preferences}
      />

      {/* Mobil Sidebar Karartma Perdesi (Overlay Backdrop) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-[1px] z-30 lg:hidden cursor-pointer transition-all duration-300"
        />
      )}

      {/* Ana Çalışma Paneli */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Mobil Header Üst Menü */}
        <header className="lg:hidden flex items-center justify-between px-6 py-3 border-b border-sepia-300 dark:border-stone-900 bg-white/80 dark:bg-stone-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-[#2c2621] dark:text-stone-400 hover:bg-sepia-200 dark:hover:bg-stone-900 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Mobil Geri Dön Butonu */}
            <button
              onClick={handleGoToLibrary}
              className="p-1.5 rounded-lg text-sepia-accent hover:bg-sepia-200 dark:hover:bg-stone-900 cursor-pointer flex items-center gap-1 text-xs font-sans font-bold uppercase tracking-wider"
            >
              <Library className="w-4 h-4" />
              <span>Kütüphane</span>
            </button>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="font-display font-bold text-sm tracking-tight">Külliyat-ı Nur</span>
          </div>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-1.5 rounded-lg text-[#2c2621] dark:text-stone-400 hover:bg-sepia-200 dark:hover:bg-stone-900 cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>

        {/* Masaüstü Ekstra Kontroller - Artistic design style button */}
        <div className="hidden lg:flex absolute top-4 right-8 z-20 gap-2">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={`flex items-center gap-2 py-2 px-4 text-[11px] font-sans font-bold uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
              settingsOpen
                ? 'bg-sepia-900 text-white border-sepia-900'
                : 'bg-white/60 dark:bg-stone-900/80 backdrop-blur-md border-sepia-300 dark:border-stone-800 text-[#2c2621] dark:text-stone-300 hover:bg-sepia-200 dark:hover:bg-stone-850'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Lügat & Tefekkür Ayarları
          </button>
        </div>

        {/* Esnek Okuma Grid / Alanı */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          
          {/* Okuma Ekranı */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
            <ReadingView
              book={activeBook}
              pageNumber={state.currentPage}
              preferences={preferences}
              onPageChange={handleSelectPage}
              onSelectWord={handleSelectWord}
              selectedWord={state.selectedWord}
              searchQuery={state.searchQuery}
              bookmarks={state.bookmarks}
              onToggleBookmark={handleToggleBookmark}
              onGoToLibrary={handleGoToLibrary}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              dictionary={dictionary}
              fihristClickTrigger={fihristClickTrigger}
            />
          </div>

          {/* Sağ Panel: Tefekkür Ayarları */}
          <div
            className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-sepia-300 dark:border-stone-900 p-6 overflow-y-auto no-scrollbar space-y-6 bg-[#ede8df]/35 dark:bg-stone-950/20 backdrop-blur-md transition-all duration-300 ${
              settingsOpen ? 'block' : 'hidden'
            }`}
          >
            {/* Tefekkür Ayarları Paneli */}
            {settingsOpen && (
              <TefekkurSettings
                preferences={preferences}
                onChange={setPreferences}
                onReset={handleResetPreferences}
              />
            )}
            
            {/* Bilgilendirme Kartı - Beautiful and refined */}
            <div className="p-4 bg-sepia-200/50 border border-sepia-300 dark:border-stone-800/30 rounded-lg text-xs text-stone-600 dark:text-stone-400 space-y-2 leading-relaxed">
              <div className="font-sans font-bold uppercase tracking-widest text-[10px] text-sepia-accent flex items-center gap-1">
                Mütalaa Kılavuzu
              </div>
              <p>
                Risale metninde anlamını merak ettiğiniz kelimelerin üzerine tıklayarak anında lügat karşılığına erişebilirsiniz.
              </p>
              <p>
                Lügat açıklaması kelimenin hemen üzerinde şık bir balon (popup) olarak belirecektir.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Arka Plan Overlay (Mobil Sidebar için) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}
    </div>
  );
}

"use client";
import React, { useState } from 'react';
import { RisaleBook, ReadingState, DictionaryTerm, FihristItem, UserPreferences } from '../types';
import { BookOpen, Search, X, Compass, Library, ChevronRight } from 'lucide-react';

interface SidebarProps {
  books: RisaleBook[];
  fihristNodes?: FihristItem[];
  state: ReadingState;
  onSelectBook: (bookId: string, pageNumber?: number) => void;
  onSelectPage: (pageNumber: number, isFromFihrist?: boolean) => void;
  onSearchChange: (query: string) => void;
  onToggleSidebar?: () => void;
  isOpen?: boolean;
  onGoToLibrary: () => void;
  dictionary: Record<string, DictionaryTerm>;
  onSelectWord: (term: DictionaryTerm) => void;
  theme?: 'light' | 'sepia' | 'dark' | string;
  preferences?: UserPreferences;
}

interface FihristNodeItemProps {
  node: FihristItem;
  currentPage: number;
  onSelectPage: (pageNumber: number, isFromFihrist?: boolean) => void;
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  searchActive: boolean;
  searchQuery?: string;
  theme?: 'light' | 'sepia' | 'dark';
}

const simplifyChar = (char: string): string => {
  const lower = char.toLowerCase();
  switch (lower) {
    case 'â': return 'a';
    case 'î': case 'ı': case 'i': return 'i';
    case 'û': case 'ü': return 'u';
    case 'ö': return 'o';
    case 'ç': return 'c';
    case 'ğ': return 'g';
    case 'ş': return 's';
    default: return lower;
  }
};

const simplifyString = (str: string): string => {
  return Array.from(str).map(simplifyChar).join('');
};

const getHighlightRanges = (text: string, query: string) => {
  const trimmed = query ? query.trim() : '';
  if (!trimmed) return [];
  const simpleText = simplifyString(text);
  const simpleQuery = simplifyString(trimmed);
  const ranges: Array<{ start: number; end: number }> = [];
  let index = simpleText.indexOf(simpleQuery);
  while (index !== -1) {
    ranges.push({ start: index, end: index + simpleQuery.length });
    index = simpleText.indexOf(simpleQuery, index + Math.max(1, simpleQuery.length));
  }
  return ranges;
};

const getFihristHighlightClass = (theme: 'light' | 'dark' | 'sepia' | string) => {
  if (theme === 'dark') {
    return 'bg-amber-500/35 text-amber-100 border-b border-amber-500 font-bold px-0.5 rounded-sm';
  } else if (theme === 'sepia') {
    return 'bg-[#f4cf8a] text-[#422402] border-b border-[#bc872e] font-bold px-0.5 rounded-sm';
  } else {
    return 'bg-amber-200 text-stone-950 border-b border-amber-500 font-bold px-0.5 rounded-sm';
  }
};

const renderTextWithHighlight = (text: string, query: string, highlightClass: string) => {
  if (!query) return text;
  const ranges = getHighlightRanges(text, query);
  if (ranges.length === 0) return text;

  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  ranges.forEach((range, idx) => {
    if (range.start > lastIndex) {
      result.push(text.substring(lastIndex, range.start));
    }
    result.push(
      <mark key={idx} className={highlightClass}>
        {text.substring(range.start, range.end)}
      </mark>
    );
    lastIndex = range.end;
  });
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }
  return <>{result}</>;
};

interface InBookSearchResult {
  pageNumber: number;
  snippet: string;
}

const cleanTextForPreview = (text: string): string => {
  return text
    .replace(/\|\d+@/g, '') // |1@, |882@ gibi dipnot işaretlerini temizle
    .replace(/[\\[\]{}()<>~*&]/g, '') // \, &, >, <, ~ gibi biçimlendirme elemanlarını temizle
    .replace(/\s+/g, ' ') // Boşlukları düzenle
    .trim();
};

const searchInBookPages = (
  pages: { [pageNumber: number]: any } | undefined,
  query: string
): InBookSearchResult[] => {
  if (!pages || !query || query.trim().length < 2) return [];
  const normalizedQuery = simplifyString(query);
  const results: InBookSearchResult[] = [];

  // Sayfaları sayısal sıraya göre sıralayalım
  const sortedPageNumbers = Object.keys(pages)
    .map(Number)
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  for (const pageNum of sortedPageNumbers) {
    const page = pages[pageNum];
    if (!page || !page.text) continue;

    const cleanedText = cleanTextForPreview(page.text);
    const simplifiedText = simplifyString(cleanedText);
    const index = simplifiedText.indexOf(normalizedQuery);

    if (index !== -1) {
      // Eşleşen kelimenin etrafında güzel bir kesit oluşturalım
      const start = Math.max(0, index - 45);
      const end = Math.min(cleanedText.length, index + normalizedQuery.length + 55);
      let snippet = cleanedText.substring(start, end);

      if (start > 0) snippet = '...' + snippet;
      if (end < cleanedText.length) snippet = snippet + '...';

      results.push({
        pageNumber: pageNum,
        snippet: snippet,
      });
    }
  }

  return results;
};

const FihristNodeItem: React.FC<FihristNodeItemProps> = ({
  node,
  currentPage,
  onSelectPage,
  expandedNodes,
  onToggleExpand,
  searchActive,
  searchQuery = '',
  theme = 'light',
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = searchActive || !!expandedNodes[node.id];
  const isCurrent = currentPage === node.page;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectPage(node.page, true);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.id);
  };

  if (node.level === 0) {
    return (
      <div className="space-y-1">
        {hasChildren && node.children.map((child) => (
          <FihristNodeItem
            key={child.id}
            node={child}
            currentPage={currentPage}
            onSelectPage={onSelectPage}
            expandedNodes={expandedNodes}
            onToggleExpand={onToggleExpand}
            searchActive={searchActive}
            searchQuery={searchQuery}
            theme={theme}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="select-none">
      <div
        className={`group flex items-center justify-between py-1.5 px-2 rounded-lg text-xs transition-all cursor-pointer ${
          isCurrent
            ? theme === 'dark'
              ? 'bg-amber-500/15 text-amber-200 font-semibold border border-amber-500/20'
              : theme === 'sepia'
              ? 'bg-[#854d0e]/10 text-[#854d0e] font-semibold border border-[#854d0e]/20'
              : 'bg-[#9a3412]/10 text-[#9a3412] font-semibold border border-[#9a3412]/20'
            : theme === 'dark'
            ? 'text-stone-300 hover:bg-stone-900/50'
            : theme === 'sepia'
            ? 'text-[#453c35] hover:bg-[#ebd9c1]/50 font-medium'
            : 'text-stone-700 hover:bg-stone-100 font-medium'
        }`}
        style={{ paddingLeft: `${(node.level - 1) * 12 + 4}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={handleToggle}
              className="p-0.5 rounded-sm hover:bg-sepia-300/40 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer flex-shrink-0"
            >
              <ChevronRight
                className={`w-3 h-3 transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}
          <span className="truncate pr-2">
            {searchQuery 
              ? renderTextWithHighlight(node.title, searchQuery, getFihristHighlightClass(theme))
              : node.title}
          </span>
        </div>
        <span className="text-[9px] font-mono opacity-60 flex-shrink-0">
          S. {node.page}
        </span>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-0.5 space-y-0.5 border-l border-sepia-300/30 dark:border-stone-800/40 ml-[13px]">
          {node.children.map((child) => (
            <FihristNodeItem
              key={child.id}
              node={child}
              currentPage={currentPage}
              onSelectPage={onSelectPage}
              expandedNodes={expandedNodes}
              onToggleExpand={onToggleExpand}
              searchActive={searchActive}
              searchQuery={searchQuery}
              theme={theme}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Recursive tree filter
const filterFihristTree = (nodes: FihristItem[], query: string): FihristItem[] => {
  if (!query) return nodes;
  const simpleQuery = simplifyString(query);
  return nodes
    .map((node) => {
      const filteredChildren = node.children ? filterFihristTree(node.children, query) : [];
      const matchesThisNode = simplifyString(node.title).includes(simpleQuery);
      const hasMatchingChildren = filteredChildren.length > 0;
      if (matchesThisNode || hasMatchingChildren) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter((n): n is FihristItem => n !== null);
};

export const Sidebar: React.FC<SidebarProps> = ({
  books,
  fihristNodes = [],
  state,
  onSelectBook,
  onSelectPage,
  onSearchChange,
  onToggleSidebar,
  isOpen = true,
  onGoToLibrary,
  dictionary,
  onSelectWord,
  theme: themeProp,
  preferences,
}) => {
  const theme = themeProp || preferences?.theme || 'light';
  const activeTab = 'fihrist';
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const handleToggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentBook = books.find((b) => b.id === state.currentBookId) || books[0];

  // Kitap içi arama sonuçları hesaplaması
  const bookSearchResults = searchInBookPages(currentBook.pages, state.searchQuery);

  const getSidebarThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#181614] text-[#e7e5e4] border-stone-900';
      case 'sepia':
        return 'bg-[#f5f2ed] text-[#2c2621] border-sepia-300';
      case 'light':
      default:
        return 'bg-[#fdfcf9] text-[#1c1917] border-stone-200';
    }
  };

  const getHeaderClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#131110] border-stone-900';
      case 'sepia':
        return 'bg-[#ebd9c1]/40 border-sepia-300';
      case 'light':
      default:
        return 'bg-stone-50 border-stone-200';
    }
  };

  const getFooterClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#131110] border-t border-stone-900';
      case 'sepia':
        return 'bg-[#ebd9c1]/30 border-t border-sepia-300';
      case 'light':
      default:
        return 'bg-stone-50 border-t border-stone-200';
    }
  };

  const getInputClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#131110] text-[#e7e5e4] placeholder-stone-500 border-stone-800/80 focus:ring-amber-500/50 focus:border-amber-500';
      case 'sepia':
        return 'bg-white text-[#2c2621] placeholder-stone-400 border-sepia-300 focus:ring-sepia-accent focus:border-sepia-accent';
      case 'light':
      default:
        return 'bg-white text-[#1c1917] placeholder-stone-400 border-stone-200 focus:ring-sepia-accent focus:border-sepia-accent';
    }
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col border-r transition-all duration-300 overflow-hidden ${getSidebarThemeClasses()} ${
        isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full border-r-0 lg:w-0'
      }`}
    >
      {/* İçeriğin daralırken bozulmasını önlemek için sabit genişlikli sarıcı */}
      <div className="w-80 h-full flex flex-col shrink-0">
        
        {/* Sidebar Header - Sanatsal MikatiNur Başlığı */}
        <div className={`p-6 border-b relative ${getHeaderClasses()}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className={`text-[10px] tracking-[0.2em] uppercase font-sans font-bold opacity-45 mb-1 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-600'}`}>
                MikatiNur Okuma
              </h2>
              <h1 className={`text-xl font-display font-light italic leading-tight ${theme === 'dark' ? 'text-amber-50' : 'text-sepia-900'}`}>
                Risale-i Nur Külliyatı
              </h1>
            </div>
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Ana Kütüphane'ye Dön Butonu */}
          <button
            onClick={onGoToLibrary}
            className={`mt-4 w-full flex items-center justify-center gap-2 py-1.5 px-4 rounded-full border text-xs font-sans font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
              theme === 'dark'
                ? 'border-stone-800 bg-stone-900 text-stone-200 hover:bg-stone-800'
                : theme === 'sepia'
                ? 'border-sepia-300 bg-white/75 text-[#2c2621] hover:bg-sepia-200/60'
                : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-100'
            }`}
          >
            <Library className="w-3 h-3 text-sepia-accent" />
            Kütüphane Paneline Dön
          </button>
        </div>

        {/* Fihrist / Külliyat / Lügat Geçiş Sekmeleri (Tab Bar) - Sadece Fihrist Kaldı */}
        <div className={`flex border-b text-[10px] tracking-widest uppercase font-sans ${theme === 'dark' ? 'border-stone-900 bg-stone-950/20' : theme === 'sepia' ? 'border-sepia-300 bg-[#ede8df]/20' : 'border-stone-200 bg-stone-50'}`}>
          <div className="flex-1 py-3 text-center border-b-2 border-sepia-accent text-sepia-accent font-bold">
            Kitap Fihristi ve İçindekiler
          </div>
        </div>

        {/* Dinamik Arama Kutusu */}
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-stone-900/60' : theme === 'sepia' ? 'border-sepia-300/60' : 'border-stone-200/60'}`}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              placeholder="Kitap içinde ara..."
              value={state.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 font-sans ${getInputClasses()}`}
            />
            {state.searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-[10px] uppercase tracking-wider text-stone-400 hover:text-sepia-accent font-sans font-medium"
              >
                Temizle
              </button>
            )}
          </div>
        </div>

        {/* Tab İçerikleri */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
          
          <div className="space-y-6">
            {/* Aktif Kitap Başlığı */}
            <div>
              <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest">
                Şu An Okunan Kitap
              </span>
              <h3 className={`font-serif font-bold text-base mt-0.5 ${theme === 'dark' ? 'text-amber-100' : 'text-sepia-900'}`}>
                {currentBook.title}
              </h3>
              <p className="text-[10px] font-sans opacity-50 mt-0.5">{currentBook.author}</p>
            </div>

            {/* Arama Sonuçları veya Fihrist Listesi */}
            <div>
              {state.searchQuery.trim().length >= 2 ? (
                // Kitap İçi Arama Sonuçları Modu
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] opacity-45">
                      Kitap İçi Arama Sonuçları
                    </label>
                    <span className="text-[9px] text-sepia-accent font-sans font-bold">
                      {bookSearchResults.length} Eşleşme
                    </span>
                  </div>

                  <div className="space-y-3">
                    {bookSearchResults.length > 0 ? (
                      bookSearchResults.map((result) => {
                        const isCurrent = state.currentPage === result.pageNumber;
                        return (
                          <button
                            key={result.pageNumber}
                            onClick={() => onSelectPage(result.pageNumber, true)}
                            className={`w-full text-left p-3 rounded-lg border transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                              isCurrent
                                ? 'border-sepia-accent/60 bg-sepia-100/30 dark:bg-amber-950/10'
                                : theme === 'dark'
                                ? 'bg-stone-900/30 border-stone-800/80 hover:bg-stone-900/60 hover:border-stone-700'
                                : theme === 'sepia'
                                ? 'bg-[#ede8df]/30 border-sepia-300/40 hover:bg-[#ede8df]/60 hover:border-sepia-300/80'
                                : 'bg-stone-50 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className={`font-sans font-bold text-[10px] uppercase tracking-wider ${
                                isCurrent ? 'text-sepia-accent' : 'text-stone-400 dark:text-stone-500'
                              }`}>
                                Sayfa {result.pageNumber}
                              </span>
                              <span className="text-[9px] font-mono opacity-40">Git &rarr;</span>
                            </div>
                            <p className={`font-serif text-xs leading-relaxed line-clamp-3 ${
                              theme === 'dark' ? 'text-stone-300' : 'text-stone-600'
                            }`}>
                              {renderTextWithHighlight(result.snippet, state.searchQuery, getFihristHighlightClass(theme))}
                            </p>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-stone-400 text-xs py-3 text-center font-sans">
                        Bu kitapta "{state.searchQuery}" kelimesi geçmiyor.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Standart Fihrist Modu
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] opacity-45">
                      Fihrist / İçindekiler
                    </label>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">
                      {fihristNodes.length > 0 ? 'Dinamik Fihrist' : `${currentBook.sections.length} Bölüm`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {fihristNodes.length > 0 ? (
                      fihristNodes.map((node) => (
                        <FihristNodeItem
                          key={node.id}
                          node={node}
                          currentPage={state.currentPage}
                          onSelectPage={onSelectPage}
                          expandedNodes={expandedNodes}
                          onToggleExpand={handleToggleExpand}
                          searchActive={false}
                          searchQuery=""
                          theme={theme as 'sepia' | 'dark' | 'light' | undefined}
                        />
                      ))
                    ) : (
                      <div className={`space-y-1 pl-3 border-l ${theme === 'dark' ? 'border-stone-800' : theme === 'sepia' ? 'border-sepia-300' : 'border-stone-250'}`}>
                        {currentBook.sections.map((sec) => {
                          const isCurrentSection = state.currentPage >= sec.startPage && 
                            (!currentBook.sections.find((s) => s.startPage > sec.startPage) ||
                              state.currentPage < (currentBook.sections.find((s) => s.startPage > sec.startPage)?.startPage || 999));
                          
                          return (
                            <button
                              key={sec.id}
                              onClick={() => onSelectPage(sec.startPage, true)}
                              className={`w-full flex items-center justify-between py-1.5 text-left transition-all text-xs font-sans cursor-pointer ${
                                isCurrentSection
                                  ? 'text-sepia-accent font-semibold tracking-wide'
                                  : theme === 'dark'
                                  ? 'text-stone-400 hover:text-stone-200'
                                  : theme === 'sepia'
                                  ? 'text-[#453c35] hover:text-[#854d0e]'
                                  : 'text-stone-500 hover:text-stone-900'
                              }`}
                            >
                              <span className="truncate pr-2">{sec.title}</span>
                              <span className="text-[9px] opacity-45 font-mono flex-shrink-0">
                                S. {sec.startPage}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kaldığım Yerler (Bookmarks) */}
            {state.bookmarks.length > 0 && (
              <div className={`border-t pt-5 ${theme === 'dark' ? 'border-stone-900/60' : theme === 'sepia' ? 'border-sepia-300/60' : 'border-stone-200/60'}`}>
                <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] opacity-45 mb-3">
                  Kaldığım Yerler
                </label>
                <div className="space-y-2">
                  {state.bookmarks.map((bookmark, index) => {
                    const book = books.find((b) => b.id === bookmark.bookId);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          onSelectBook(bookmark.bookId, bookmark.page);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded text-left transition-all text-xs border cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-stone-900/40 hover:bg-stone-900 border-stone-800 text-stone-300'
                            : theme === 'sepia'
                            ? 'bg-[#ebd9c1]/20 hover:bg-[#ebd9c1]/40 border-sepia-300/50 text-stone-700'
                            : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                        }`}
                      >
                        <span className="truncate font-sans font-medium">
                          {book?.title || bookmark.bookId}
                        </span>
                        <span className="text-[9px] font-mono text-sepia-accent whitespace-nowrap ml-2">
                          S. {bookmark.page}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Footer - Bilgilendirici Durum */}
        <div className={`p-4 text-[9px] font-sans tracking-widest uppercase ${getFooterClasses()}`}>
          <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>MikatiNur Okuyucu Modu</span>
          </div>
        </div>

      </div>
    </aside>
  );
};

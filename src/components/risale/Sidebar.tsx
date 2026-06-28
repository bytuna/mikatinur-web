"use client";
import React, { useState } from 'react';
import { RisaleBook, ReadingState, DictionaryTerm, FihristItem } from './types';
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
}

interface FihristNodeItemProps {
  node: FihristItem;
  currentPage: number;
  onSelectPage: (pageNumber: number, isFromFihrist?: boolean) => void;
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  searchActive: boolean;
}

const FihristNodeItem: React.FC<FihristNodeItemProps> = ({
  node,
  currentPage,
  onSelectPage,
  expandedNodes,
  onToggleExpand,
  searchActive,
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
            ? 'bg-sepia-accent/15 dark:bg-stone-900/50 text-sepia-accent font-semibold'
            : 'text-stone-600 dark:text-stone-300 hover:bg-sepia-200/40 dark:hover:bg-stone-900/30'
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
          <span className="truncate pr-2">{node.title}</span>
        </div>
        <span className="text-[9px] font-mono opacity-50 flex-shrink-0">
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
  const lowerQuery = query.toLowerCase();
  return nodes
    .map((node) => {
      const filteredChildren = node.children ? filterFihristTree(node.children, query) : [];
      const matchesThisNode = node.title.toLowerCase().includes(lowerQuery);
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
}) => {
  const activeTab = 'fihrist';
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const handleToggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const currentBook = books.find((b) => b.id === state.currentBookId) || books[0];

  // Arama filtrelemesi
  const filteredSections = currentBook.sections.filter((sec) =>
    sec.title.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(state.searchQuery.toLowerCase())
  );

  const filteredTerms = (Object.values(dictionary) as DictionaryTerm[])
    .filter((term) =>
      term.word.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(state.searchQuery.toLowerCase())
    )
    .slice(0, 50); // Performans için 50 kelime ile sınırla

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-40 h-screen flex flex-col border-r transition-all duration-300 bg-sepia-100/50 dark:bg-stone-950 border-sepia-300 dark:border-stone-900 overflow-hidden ${
        isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full border-r-0 lg:w-0'
      }`}
    >
      {/* İçeriğin daralırken bozulmasını önlemek için sabit genişlikli sarıcı */}
      <div className="w-80 h-full flex flex-col shrink-0">
        
        {/* Sidebar Header - Sanatsal MikatiNur Başlığı */}
        <div className="p-6 border-b border-sepia-300 dark:border-stone-900 bg-[#ede8df]/40 dark:bg-stone-900/40 relative">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[10px] tracking-[0.2em] uppercase font-sans font-bold opacity-45 mb-1 dark:text-stone-400">
                MikatiNur Okuma
              </h2>
              <h1 className="text-xl font-display font-light italic leading-tight text-sepia-900 dark:text-amber-50">
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
            className="mt-4 w-full flex items-center justify-center gap-2 py-1.5 px-4 rounded-full border border-sepia-300 dark:border-stone-850 bg-white/75 dark:bg-stone-900 text-[#2c2621] dark:text-stone-200 text-xs font-sans font-bold uppercase tracking-wider hover:bg-sepia-200/60 dark:hover:bg-stone-800 transition-all shadow-xs cursor-pointer"
          >
            <Library className="w-3 h-3 text-sepia-accent" />
            Kütüphane Paneline Dön
          </button>
        </div>

        {/* Fihrist / Külliyat / Lügat Geçiş Sekmeleri (Tab Bar) - Sadece Fihrist Kaldı */}
        <div className="flex border-b border-sepia-300 dark:border-stone-900 bg-[#ede8df]/20 dark:bg-stone-900/10 text-[10px] tracking-widest uppercase font-sans">
          <div className="flex-1 py-3 text-center border-b-2 border-sepia-accent text-sepia-accent bg-white/10 font-bold">
            Kitap Fihristi ve İçindekiler
          </div>
        </div>

        {/* Dinamik Arama Kutusu */}
        <div className="p-4 border-b border-sepia-300/60 dark:border-stone-900/60">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              placeholder="Fihristte bölüm ara..."
              value={state.searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-sepia-300 dark:border-stone-850 bg-white/50 dark:bg-stone-900/50 focus:outline-none focus:ring-1 focus:ring-sepia-accent focus:border-sepia-accent dark:text-stone-100 dark:placeholder-stone-500 font-sans"
            />
            {state.searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2 text-[10px] uppercase tracking-wider text-stone-400 hover:text-sepia-accent font-sans font-medium"
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
              <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest dark:text-stone-500">
                Şu An Okunan Kitap
              </span>
              <h3 className="font-serif font-bold text-base text-sepia-900 dark:text-amber-100 mt-0.5">
                {currentBook.title}
              </h3>
              <p className="text-[10px] font-sans opacity-50 mt-0.5">{currentBook.author}</p>
            </div>

            {/* Bölümler Listesi */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] opacity-45 dark:text-stone-400">
                  Fihrist / İçindekiler
                </label>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">
                  {fihristNodes.length > 0 ? 'Dinamik Fihrist' : `${filteredSections.length} Bölüm`}
                </span>
              </div>

              <div className="space-y-1">
                {fihristNodes.length > 0 ? (
                  (() => {
                    const filteredNodes = filterFihristTree(fihristNodes, state.searchQuery);
                    return filteredNodes.length > 0 ? (
                      filteredNodes.map((node) => (
                        <FihristNodeItem
                          key={node.id}
                          node={node}
                          currentPage={state.currentPage}
                          onSelectPage={onSelectPage}
                          expandedNodes={expandedNodes}
                          onToggleExpand={handleToggleExpand}
                          searchActive={!!state.searchQuery}
                        />
                      ))
                    ) : (
                      <div className="text-stone-400 text-xs py-2">Fihristte sonuç bulunamadı.</div>
                    );
                  })()
                ) : (
                  <div className="space-y-1 pl-3 border-l border-sepia-300/60 dark:border-stone-900">
                    {filteredSections.map((sec) => {
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
                              : 'text-stone-500 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-200'
                          }`}
                        >
                          <span className="truncate pr-2">{sec.title}</span>
                          <span className="text-[9px] opacity-45 font-mono flex-shrink-0">
                            S. {sec.startPage}
                          </span>
                        </button>
                      );
                    })}
                    {filteredSections.length === 0 && (
                      <div className="text-stone-400 text-xs py-2">Bölüm bulunamadı.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Kaldığım Yerler (Bookmarks) */}
            {state.bookmarks.length > 0 && (
              <div className="border-t border-sepia-300/30 dark:border-stone-900 pt-5">
                <label className="block text-[10px] font-sans font-bold uppercase tracking-[0.15em] opacity-45 mb-3 dark:text-stone-400">
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
                        className="w-full flex items-center justify-between p-2 rounded bg-sepia-200/40 hover:bg-sepia-200 dark:bg-stone-900/30 dark:hover:bg-stone-900 text-left transition-all text-xs border border-sepia-300/20 dark:border-stone-800/30 cursor-pointer"
                      >
                        <span className="truncate font-sans font-medium text-stone-700 dark:text-stone-350">
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
        <div className="p-4 bg-sepia-200/60 dark:bg-stone-900 text-[9px] font-sans tracking-widest uppercase border-t border-sepia-300 dark:border-stone-900">
          <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>MikatiNur Okuyucu Modu</span>
          </div>
        </div>

      </div>
    </aside>
  );
};

"use client";
import React, { useState, useMemo } from 'react';
import { RisaleBook, ReadingState, DictionaryTerm, FihristItem, UserPreferences, UserNote } from '../types';
import { BookOpen, Search, X, Compass, Library, ChevronRight, Plus, Trash2, ChevronDown, BookMarked, FileText } from 'lucide-react';
import { BOOK_CONTENTS } from '../bookContents';
import { turkishToLower } from '../kulliyat';

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
  notes: UserNote[];
  onNotesChange: (notes: UserNote[]) => void;
}

interface FihristNodeItemProps {
  node: FihristItem;
  currentPage: number;
  onSelectPage: (pageNumber: number, isFromFihrist?: boolean) => void;
  expandedNodes: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  searchActive: boolean;
  searchQuery?: string;
  theme?: 'light' | 'sepia' | 'dark' | string;
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
  } else if (theme === 'saman') {
    return 'bg-[#dfbe73] text-[#3a2002] border-b border-[#b08b35] font-bold px-0.5 rounded-sm';
  } else if (theme === 'green') {
    return 'bg-emerald-200 text-emerald-950 border-b border-emerald-600 font-bold px-0.5 rounded-sm';
  } else if (theme === 'gray') {
    return 'bg-blue-200 text-blue-950 border-b border-blue-600 font-bold px-0.5 rounded-sm';
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
  notes,
  onNotesChange,
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
  const activeBookContents = BOOK_CONTENTS[currentBook.id];

  // Kitap içi arama sonuçları hesaplaması
  const bookSearchResults = searchInBookPages(currentBook.pages, state.searchQuery);

  // Tefekkür Notları State & Metodları
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isContentsExpanded, setIsContentsExpanded] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [includeReference, setIncludeReference] = useState(true);
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [noteColor, setNoteColor] = useState<'yellow' | 'blue' | 'green' | 'red'>('yellow');

  const filteredNotes = useMemo(() => {
    if (!notesSearchQuery.trim()) return notes;
    const q = simplifyString(turkishToLower(notesSearchQuery.trim()));
    return notes.filter((note) => {
      const textMatches = simplifyString(turkishToLower(note.text)).includes(q);
      const bookMatches = note.reference
        ? simplifyString(turkishToLower(note.reference.bookTitle)).includes(q)
        : false;
      return textMatches || bookMatches;
    });
  }, [notes, notesSearchQuery]);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: UserNote = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
      createdAt: new Date().toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      color: noteColor,
      reference: includeReference ? {
        bookId: currentBook.id,
        bookTitle: currentBook.title,
        page: state.currentPage,
      } : undefined,
    };
    const updatedNotes = [newNote, ...notes];
    onNotesChange(updatedNotes);
    localStorage.setItem('mikatinur_notes', JSON.stringify(updatedNotes));
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    onNotesChange(updatedNotes);
    localStorage.setItem('mikatinur_notes', JSON.stringify(updatedNotes));
  };

  const getNotesPanelClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#151312] border-stone-850/80';
      case 'sepia':
        return 'bg-[#ebd9c1]/20 border-sepia-300/60';
      case 'saman':
        return 'bg-[#dfbe73]/20 border-[#d0c091]/60';
      case 'green':
        return 'bg-[#d7e6d7]/20 border-[#c3d1c3]/60';
      case 'gray':
        return 'bg-[#dee3e7]/20 border-[#ccd2d7]/60';
      case 'light':
      default:
        return 'bg-stone-50/50 border-stone-200';
    }
  };

  const getNoteColorStyles = (color: 'yellow' | 'blue' | 'green' | 'red' | undefined) => {
    if (!color) return '';
    
    if (theme === 'dark') {
      switch (color) {
        case 'yellow': return 'bg-amber-950/20 border-amber-900/40 border-l-4 border-l-amber-500 text-amber-200/90';
        case 'blue': return 'bg-blue-950/20 border-blue-900/40 border-l-4 border-l-blue-500 text-blue-200/90';
        case 'green': return 'bg-emerald-950/20 border-emerald-900/40 border-l-4 border-l-emerald-500 text-emerald-200/90';
        case 'red': return 'bg-rose-950/20 border-rose-900/40 border-l-4 border-l-rose-500 text-rose-200/90';
      }
    } else if (theme === 'sepia') {
      switch (color) {
        case 'yellow': return 'bg-amber-100/40 border-amber-200/60 border-l-4 border-l-amber-600 text-amber-950';
        case 'blue': return 'bg-blue-100/40 border-blue-200/60 border-l-4 border-l-blue-600 text-blue-950';
        case 'green': return 'bg-emerald-100/40 border-emerald-200/60 border-l-4 border-l-emerald-700 text-emerald-950';
        case 'red': return 'bg-rose-100/40 border-rose-200/60 border-l-4 border-l-rose-600 text-rose-950';
      }
    } else if (theme === 'saman') {
      switch (color) {
        case 'yellow': return 'bg-[#f7ebb5]/60 border-[#ebd88d]/60 border-l-4 border-l-amber-600 text-[#3a2f14]';
        case 'blue': return 'bg-[#daf1f9]/60 border-[#b2e1f2]/60 border-l-4 border-l-blue-600 text-[#123946]';
        case 'green': return 'bg-[#e4f4e4]/60 border-[#bde4bd]/60 border-l-4 border-l-emerald-700 text-[#143414]';
        case 'red': return 'bg-[#fbe5e6]/60 border-[#f5c7c9]/60 border-l-4 border-l-rose-600 text-[#4c1618]';
      }
    } else if (theme === 'green') {
      switch (color) {
        case 'yellow': return 'bg-[#faf3cd]/50 border-[#eddba4]/50 border-l-4 border-l-amber-600 text-[#332a10]';
        case 'blue': return 'bg-[#e3f4fc]/50 border-[#c4e8fa]/50 border-l-4 border-l-blue-600 text-[#133242]';
        case 'green': return 'bg-[#f4faf4]/50 border-[#d8edd8]/50 border-l-4 border-l-emerald-600 text-[#112d15]';
        case 'red': return 'bg-[#fdf0f1]/50 border-[#f9d7da]/50 border-l-4 border-l-rose-600 text-[#411417]';
      }
    } else if (theme === 'gray') {
      switch (color) {
        case 'yellow': return 'bg-amber-50/50 border-amber-200/50 border-l-4 border-l-amber-500 text-amber-900';
        case 'blue': return 'bg-blue-50/50 border-blue-200/50 border-l-4 border-l-blue-500 text-blue-900';
        case 'green': return 'bg-emerald-50/50 border-emerald-200/50 border-l-4 border-l-emerald-600 text-emerald-900';
        case 'red': return 'bg-rose-50/50 border-rose-200/50 border-l-4 border-l-rose-500 text-rose-900';
      }
    } else { // light
      switch (color) {
        case 'yellow': return 'bg-amber-50/60 border-amber-200/60 border-l-4 border-l-amber-500 text-amber-900';
        case 'blue': return 'bg-blue-50/60 border-blue-200/60 border-l-4 border-l-blue-500 text-blue-900';
        case 'green': return 'bg-emerald-50/60 border-emerald-200/60 border-l-4 border-l-emerald-600 text-emerald-900';
        case 'red': return 'bg-rose-50/60 border-rose-200/60 border-l-4 border-l-rose-500 text-rose-900';
      }
    }
  };

  const getNoteItemClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#1b1917]/70 border-stone-800 text-stone-200';
      case 'sepia':
        return 'bg-white/60 border-sepia-200/60 text-[#2c2621]';
      case 'saman':
        return 'bg-[#f3eac8]/60 border-[#d0c091]/60 text-[#332913]';
      case 'green':
        return 'bg-[#edf4ed]/60 border-[#c3d1c3]/60 text-[#142918]';
      case 'gray':
        return 'bg-[#f0f3f5]/60 border-[#ccd2d7]/60 text-[#1e252b]';
      case 'light':
      default:
        return 'bg-white border-stone-200 text-stone-800';
    }
  };

  const getSidebarThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-[#181614] text-[#e7e5e4] border-stone-900';
      case 'sepia':
        return 'bg-[#f5f2ed] text-[#2c2621] border-sepia-300';
      case 'saman':
        return 'bg-[#ebdcae] text-[#332913] border-[#d0c091]';
      case 'green':
        return 'bg-[#e3eee3] text-[#142918] border-[#c3d1c3]';
      case 'gray':
        return 'bg-[#e8ecef] text-[#1e252b] border-[#ccd2d7]';
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
      case 'saman':
        return 'bg-[#e3d3a0] border-[#d0c091]';
      case 'green':
        return 'bg-[#d7e6d7] border-[#c3d1c3]';
      case 'gray':
        return 'bg-[#dee3e7] border-[#ccd2d7]';
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
      case 'saman':
        return 'bg-[#e3d3a0] border-t border-[#d0c091]';
      case 'green':
        return 'bg-[#d7e6d7] border-t border-[#c3d1c3]';
      case 'gray':
        return 'bg-[#dee3e7] border-t border-[#ccd2d7]';
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
      case 'saman':
        return 'bg-[#f3eac8] text-[#332913] placeholder-[#7d6f4c] border-[#d0c091] focus:ring-yellow-600 focus:border-yellow-600';
      case 'green':
        return 'bg-[#edf4ed] text-[#142918] placeholder-emerald-700/60 border-[#c3d1c3] focus:ring-emerald-600 focus:border-emerald-600';
      case 'gray':
        return 'bg-[#f0f3f5] text-[#1e252b] placeholder-slate-500/60 border-[#ccd2d7] focus:ring-blue-600 focus:border-blue-600';
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
                RİSALE-İ NUR
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
            
            {/* Tefekkür Notları Paneli */}
            <div className={`border rounded-xl p-3.5 transition-all duration-300 ${getNotesPanelClasses()}`}>
              <button
                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                className="w-full flex items-center justify-between text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-sepia-accent'}`} />
                  <span className={`font-sans font-bold text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>
                    Tefekkür Notlarım
                  </span>
                  {notes.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-sepia-accent/20 text-sepia-accent font-bold font-mono">
                      {notes.length}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${
                    isNotesExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isNotesExpanded && (
                <div className="mt-4 space-y-4">
                  {/* Yeni Not Ekleme Formu */}
                  <div className="space-y-2">
                    <textarea
                      placeholder="Tefekkür notunuzu buraya yazın..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      rows={3}
                      className={`w-full p-2.5 text-xs rounded-lg border focus:outline-none focus:ring-1 resize-none font-sans ${getInputClasses()}`}
                    />
                    
                    {/* Renk Seçici */}
                    <div className="flex items-center gap-2 py-0.5 select-none">
                      <span className="text-[10px] font-sans opacity-70">Not Rengi:</span>
                      <div className="flex items-center gap-1.5">
                        {(['yellow', 'blue', 'green', 'red'] as const).map((color) => {
                          const bgClasses = {
                            yellow: 'bg-amber-400 border-amber-500 dark:bg-amber-500 dark:border-amber-600',
                            blue: 'bg-blue-400 border-blue-500 dark:bg-blue-500 dark:border-blue-600',
                            green: 'bg-emerald-500 border-emerald-600 dark:bg-emerald-600 dark:border-emerald-700',
                            red: 'bg-rose-500 border-rose-600 dark:bg-rose-600 dark:border-rose-700',
                          };
                          const isSelected = noteColor === color;
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNoteColor(color)}
                              className={`w-3.5 h-3.5 rounded-full border transition-all duration-200 cursor-pointer ${bgClasses[color]} ${
                                isSelected
                                  ? 'scale-125 border-stone-950 dark:border-white shadow-sm ring-1 ring-stone-400 dark:ring-stone-500'
                                  : 'opacity-50 border-transparent hover:opacity-100 hover:scale-110'
                              }`}
                              style={isSelected ? { outline: 'none' } : undefined}
                              title={
                                color === 'yellow' ? 'Sarı (Tefekkür)' :
                                color === 'blue' ? 'Mavi (Araştırma)' :
                                color === 'green' ? 'Yeşil (İlham)' :
                                'Kırmızı (Önemli)'
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={includeReference}
                          onChange={(e) => setIncludeReference(e.target.checked)}
                          className="w-3.5 h-3.5 accent-sepia-accent rounded text-sepia-accent border-stone-300 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-[10px] font-sans opacity-70">
                          Şu anki sayfayı referans ekle ({currentBook.title}, S. {state.currentPage})
                        </span>
                      </label>
                      
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="px-3 py-1.5 rounded-lg text-stone-950 bg-sepia-accent hover:bg-sepia-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-[10px] font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus className="w-3 h-3" />
                        Ekle
                      </button>
                    </div>
                  </div>

                  {/* Arama Çubuğu (Yalnızca kaydedilmiş notlar varsa gösterilir) */}
                  {notes.length > 0 && (
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Notlarda ara..."
                        value={notesSearchQuery}
                        onChange={(e) => setNotesSearchQuery(e.target.value)}
                        className={`w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 font-sans ${getInputClasses()}`}
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      {notesSearchQuery && (
                        <button
                          onClick={() => setNotesSearchQuery('')}
                          className="absolute right-2.5 top-2 hover:text-red-500 text-stone-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Kayıtlı Notlar Listesi */}
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-0.5 no-scrollbar">
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map((note) => (
                        <div
                          key={note.id}
                          className={`p-3 rounded-lg border flex flex-col gap-2 relative group/item transition-all ${
                            note.color ? getNoteColorStyles(note.color) : getNoteItemClasses()
                          }`}
                        >
                          {/* Sil Butonu */}
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="absolute right-2 top-2 p-1 rounded-md text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover/item:opacity-100 focus:opacity-100 cursor-pointer"
                            title="Notu Sil"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div className="text-xs font-serif leading-relaxed break-words whitespace-pre-wrap pr-4">
                            {note.text}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-1 border-t border-stone-400/10 pt-1.5">
                            <span className="text-[9px] font-mono opacity-40">
                              {note.createdAt}
                            </span>
                            
                            {note.reference && (
                              <button
                                onClick={() => onSelectBook(note.reference!.bookId, note.reference!.page)}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-sans font-semibold tracking-wide border border-sepia-accent/30 bg-sepia-accent/5 hover:bg-sepia-accent/15 text-sepia-accent transition-colors cursor-pointer"
                                title={`${note.reference.bookTitle} Sayfa ${note.reference.page} sayfasına git`}
                              >
                                <BookMarked className="w-2.5 h-2.5" />
                                {note.reference.bookTitle} s. {note.reference.page}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : notes.length > 0 ? (
                      <div className="text-center py-4 text-[10px] font-sans opacity-50 italic">
                        Arama kriterlerine uygun not bulunamadı.
                      </div>
                    ) : (
                      <div className="text-center py-4 text-[10px] font-sans opacity-50 italic">
                        Henüz tefekkür notu eklenmemiş.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kitap İçerik Listesi (Konu Fihristi) */}
            {activeBookContents && activeBookContents.length > 0 && (
              <div className={`border rounded-xl p-3.5 transition-all duration-300 ${getNotesPanelClasses()}`}>
                <button
                  onClick={() => setIsContentsExpanded(!isContentsExpanded)}
                  className="w-full flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 ${theme === 'dark' ? 'text-amber-400' : 'text-sepia-accent'}`} />
                    <span className={`font-sans font-bold text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>
                      {currentBook.title} Konu Listesi
                    </span>
                    <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-sepia-accent/20 text-sepia-accent font-bold font-mono">
                      {activeBookContents.length}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-300 ${
                      isContentsExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isContentsExpanded && (
                  <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-0.5 no-scrollbar">
                    {activeBookContents.map((item) => {
                      const isCurrentPage = state.currentPage === item.page;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onSelectPage(item.page, true)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col gap-1 cursor-pointer ${
                            isCurrentPage
                              ? 'bg-sepia-accent/10 border-sepia-accent text-sepia-accent font-medium'
                              : theme === 'dark'
                              ? 'bg-[#1b1917]/40 border-stone-850/50 hover:bg-[#1b1917]/80 text-stone-300'
                              : 'bg-white/40 border-stone-200/50 hover:bg-white/80 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="font-sans font-bold text-[11px] uppercase tracking-wide">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-mono opacity-60">
                              s. {item.page}
                            </span>
                          </div>
                          <p className="text-[11px] font-serif leading-relaxed opacity-80 break-words">
                            {item.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

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
                          theme={theme}
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

/**
 * Risale-i Nur Okuma Platformu - Tip Tanımlamaları
 */

export type ReadingTheme = 'light' | 'dark' | 'sepia' | 'saman' | 'green' | 'gray';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type FontStyle = 'serif' | 'sans';

export type ArabicFont = 'hamdullah' | 'hasenat' | 'uthmantaha' | 'amiri' | 'scheherazade' | 'notonaskh';

export interface UserPreferences {
  theme: ReadingTheme;
  fontSize: FontSize;
  fontStyle: FontStyle;
  lineHeight: 'tight' | 'normal' | 'relaxed' | 'loose';
  showFootnotes: boolean;
  showTefekkurHighlights: boolean; // "Renk Aç" / "Renk Kapa" Modu kontrolü
  savedScrollPosition?: number;
  arabicFont?: ArabicFont;
}

export interface DictionaryTerm {
  word: string;
  definition: string;
  origin?: string; // Arapça, Farsça vb.
  matchedWord?: string;
}

export interface Footnote {
  id: string;
  marker: string; // örn: (*), [1]
  text: string;
}

export interface RisalePage {
  pageNumber: number;
  text: string;
  footnotes: Footnote[];
  terms: string[]; // Bu sayfada geçen lügat kelimeleri
}

export interface TOCSection {
  id: string;
  title: string;
  startPage: number;
  parentTitles?: string[];
}

export interface FihristItem {
  id: string;
  title: string;
  page: number;
  level: number;
  parentId?: string;
  children: FihristItem[];
}

export interface RisaleBook {
  id: string;
  title: string;
  author: string;
  startingPage: number; // Mektubat ve Lemalar için 5, diğerleri için 1 veya belirtilen sayfa
  totalPages: number;
  sections: TOCSection[];
  pages: { [pageNumber: number]: RisalePage };
  coverImage?: string; // Kitap kapak resmi URL'si
}

export interface BookProgress {
  currentPage: number;
  pointerY?: number; // Dikey yüzde pozisyonu (0-100)
  showPointer?: boolean; // Gezen işaretçi görünürlüğü
}

export interface UserNote {
  id: string;
  text: string;
  createdAt: string;
  color?: 'yellow' | 'blue' | 'green' | 'red';
  reference?: {
    bookId: string;
    bookTitle: string;
    page: number;
  };
}

export interface ReadingState {
  currentBookId: string;
  currentPage: number;
  selectedWord: string | null;
  selectedWordDefinition: DictionaryTerm | null;
  searchQuery: string;
  bookmarks: { bookId: string; page: number; date: string }[];
  bookProgress?: Record<string, BookProgress>; // Her kitap için bağımsız okuma ilerlemesi ve işaretçi pozisyonu
}

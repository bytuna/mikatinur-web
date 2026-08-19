"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RisaleBook, UserPreferences, RisalePage, DictionaryTerm, TOCSection } from '../types';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, HelpCircle, BookOpen, Play, Pause, Square, Library, Menu, X, Pin } from 'lucide-react';
import { ReadingPageContent } from './ReadingPageContent';

interface ReadingViewProps {
  book: RisaleBook;
  pageNumber: number;
  preferences: UserPreferences;
  onPageChange: (pageNumber: number) => void;
  onSelectWord: (term: DictionaryTerm) => void;
  selectedWord: string | null;
  searchQuery: string;
  bookmarks: { bookId: string; page: number; date: string }[];
  onToggleBookmark: (bookId: string, page: number) => void;
  onGoToLibrary?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  dictionary: Record<string, DictionaryTerm>;
  fihristClickTrigger?: number;
  sections?: TOCSection[];
  savedPointerY?: number;
  savedShowPointer?: boolean;
  onUpdatePointer?: (pointerY: number, showPointer: boolean) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  book,
  pageNumber,
  preferences,
  onPageChange,
  onSelectWord,
  selectedWord,
  searchQuery,
  bookmarks,
  onToggleBookmark,
  onGoToLibrary,
  sidebarOpen = false,
  onToggleSidebar,
  dictionary,
  fihristClickTrigger = 0,
  sections,
  savedPointerY,
  savedShowPointer,
  onUpdatePointer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loadedPages, setLoadedPages] = useState<{ pageNum: number; data: RisalePage }[]>([]);
  
  // Fihrist/Yer iminden gelen odaklanma/zoom durumları
  const [focusPageNum, setFocusPageNum] = useState<number | null>(null);
  const [focusActive, setFocusActive] = useState(false);

  // Okuma süresi ve mobil ekran kararmasını engelleme durumları
  const [readingSeconds, setReadingSeconds] = useState<number>(0);

  // 1. Ekran Kararmasını Engelleme (Screen Wake Lock API)
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log('Ekran kararmasını önleme aktif (Wake Lock acquired)');
        }
      } catch (err) {
        console.warn('Ekran kararmasını önleme isteği başarısız:', err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = async () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        await requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
          console.log('Ekran kararmasını önleme devre dışı (Wake Lock released)');
        }).catch((err: any) => console.warn('Wake lock release error:', err));
      }
    };
  }, []);

  // 2. Okumada Geçen Süre Sayacı
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setReadingSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatReadingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins} dk ${secs} sn`;
    }
    return `${secs} sn`;
  };

  // 3. Bulunulan Sayfanın Fihrist Bilgisi
  const currentSectionTitle = (() => {
    if (!sections || sections.length === 0) return null;
    const activeSections = sections.filter((s) => s.startPage <= pageNumber);
    if (activeSections.length === 0) return null;
    const sorted = [...activeSections].sort((a, b) => b.startPage - a.startPage);
    const activeSec = sorted[0];
    if (activeSec.parentTitles && activeSec.parentTitles.length > 0) {
      return [...activeSec.parentTitles, activeSec.title].join(', ');
    }
    return activeSec.title;
  })();

  // 4. Okuma İşaretçisi (Gezen İşaretçi / Okuma Kılavuzu) State ve Mantığı
  const [showPointer, setShowPointer] = useState<boolean>(savedShowPointer ?? false);
  const [pointerY, setPointerY] = useState<number>(savedPointerY ?? 30); // varsayılan olarak sayfanın %30 dikey pozisyonu
  const isDraggingRef = useRef(false);

  // Kitap değiştiğinde işaretçi durumlarını güncelle
  useEffect(() => {
    setShowPointer(savedShowPointer ?? false);
    setPointerY(savedPointerY ?? 30);
  }, [book.id, savedShowPointer, savedPointerY]);

  const handleUpdatePointerRef = useRef(onUpdatePointer);
  useEffect(() => {
    handleUpdatePointerRef.current = onUpdatePointer;
  }, [onUpdatePointer]);

  // Pozisyon değişikliklerini ve görünürlüğü App.tsx'e raporla (lokal olarak kaydetmesi için)
  const savePointerState = useCallback((newY: number, nextShow: boolean) => {
    if (handleUpdatePointerRef.current) {
      handleUpdatePointerRef.current(newY, nextShow);
    }
  }, []);

  // Okuma kılavuzunu görünür alanın (viewport) ortasına konumlandıran yardımcı fonksiyon
  const getViewportCenterPercentY = useCallback(() => {
    const container = containerRef.current;
    const pageBlock = document.getElementById(`page-block-${pageNumber}`);
    if (!container || !pageBlock) return 30; // fallback

    const containerRect = container.getBoundingClientRect();
    const pageRect = pageBlock.getBoundingClientRect();

    // Container'ın dikey orta noktası
    const centerY = containerRect.top + containerRect.height / 2;

    // Bu noktanın sayfa bloğunun en üstüne olan dikey mesafesi
    const relativeY = centerY - pageRect.top;

    // Yüzdesel karşılığı
    const percentage = (relativeY / pageRect.height) * 100;

    // Sayfa dışına taşmasını engelle (%5 - %95 arası)
    return Math.max(5, Math.min(95, percentage));
  }, [pageNumber]);

  // İşaretçinin dikey olarak şu anki görünür alanda olup olmadığını kontrol eden fonksiyon
  const isPointerVisible = useCallback(() => {
    const container = containerRef.current;
    const pageBlock = document.getElementById(`page-block-${pageNumber}`);
    if (!container || !pageBlock) return false;

    const containerRect = container.getBoundingClientRect();
    const pageRect = pageBlock.getBoundingClientRect();

    // İşaretçinin piksel cinsinden dikey koordinatı
    const pointerPixelY = pageRect.top + (pageRect.height * pointerY) / 100;

    // Koordinat görünür dikey alanın içinde mi?
    return pointerPixelY >= containerRect.top && pointerPixelY <= containerRect.bottom;
  }, [pageNumber, pointerY]);

  const togglePointer = () => {
    const nextShow = !showPointer;
    let nextY = pointerY;
    if (nextShow) {
      // Sadece işaretçi şu anki görünür alanın dışındaysa ekran ortasına getir
      if (!isPointerVisible()) {
        nextY = getViewportCenterPercentY();
        setPointerY(nextY);
      }
    }
    setShowPointer(nextShow);
    savePointerState(nextY, nextShow);
  };

  const adjustPointer = (amount: number) => {
    setPointerY((prev) => {
      const next = Math.max(2, Math.min(98, prev + amount));
      savePointerState(next, showPointer);
      return next;
    });
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    
    const pageBlock = document.getElementById(`page-block-${pageNumber}`);
    if (!pageBlock) return;

    const onDrag = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      
      // Mobil kaydırmayı engelle (işaretçiyi taşırken sayfanın hareket etmemesi için)
      if (moveEvent.cancelable) {
        moveEvent.preventDefault();
      }

      const clientY = 'touches' in moveEvent 
        ? moveEvent.touches[0].clientY 
        : moveEvent.clientY;

      const rect = pageBlock.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const percentage = Math.max(2, Math.min(98, (relativeY / rect.height) * 100));
      
      setPointerY(parseFloat(percentage.toFixed(1)));
    };

    const onDragEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setPointerY((finalY) => {
          savePointerState(finalY, true);
          return finalY;
        });
      }
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDrag);
      window.removeEventListener('touchend', onDragEnd);
    };

    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', onDragEnd);
  };

  // Arama sonucuna tıklandığında ilgili kelimeye otomatik odaklanma (scroll)
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    let attempts = 0;
    const maxAttempts = 15; // 1.5 saniye boyunca elementin render edilmesini bekler

    const scrollToHighlight = () => {
      if (!containerRef.current) return;
      
      const highlightElement = containerRef.current.querySelector('.search-highlight');
      
      if (highlightElement) {
        // Tüm eşleşen vurgu elemanlarına animasyonlu parlama sınıfını ekleyelim
        const allHighlights = containerRef.current.querySelectorAll('.search-highlight');
        allHighlights.forEach((el) => {
          el.classList.add('search-highlight-active');
        });

        highlightElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(scrollToHighlight, 100);
      }
    };

    const timer = setTimeout(scrollToHighlight, 150);

    return () => clearTimeout(timer);
  }, [pageNumber, searchQuery, loadedPages]);
  
  // Yüzen Popup (Floating Tooltip/Popover) State
  const [activePopup, setActivePopup] = useState<{
    type: 'lugat' | 'meal';
    title: string;
    text: string;
    origin?: string;
    loading?: boolean;
    rect: DOMRect | null;
    targetPageNum?: number;
    targetPercentY?: number;
  } | null>(null);

  // Popup konumunu ekran dışına taşmayacak şekilde hesaplayan yardımcı fonksiyon
  const getPopupStyle = (rect: DOMRect) => {
    const popupWidth = Math.min(window.innerWidth - 32, 460); // 400'den 460'a genişletildi, daha ferah okuma için
    let left = rect.left + rect.width / 2 - popupWidth / 2;
    
    // Yatayda ekrana taşmayı önle
    if (left < 16) left = 16;
    if (left + popupWidth > window.innerWidth - 16) {
      left = window.innerWidth - popupWidth - 16;
    }

    const popupHeight = 180; // Tahmini yükseklik
    let top = rect.top - popupHeight - 14; // Varsayılan: Kelimenin 14px üstü
    let placement: 'top' | 'bottom' = 'top';

    // Dikeyde üst tarafta yeterli alan yoksa altta göster
    if (top < 80) {
      top = rect.bottom + 14;
      placement = 'bottom';
    }

    return {
      style: {
        position: 'fixed' as const,
        top: `${top}px`,
        left: `${left}px`,
        width: `${popupWidth}px`,
        zIndex: 100,
      },
      placement,
    };
  };

  const handleWordClick = useCallback((e: React.MouseEvent<HTMLSpanElement>, term: DictionaryTerm) => {
    e.stopPropagation();
    onSelectWord(term); // Sağ paneldeki asistanı da tetikler
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pageElement = e.currentTarget.closest('[data-page-num]');
    const pageNumAttr = pageElement?.getAttribute('data-page-num');
    const clickedPageNum = pageNumAttr ? parseInt(pageNumAttr, 10) : pageNumber;
    let percentY = 30;
    if (pageElement) {
      const pageRect = pageElement.getBoundingClientRect();
      const clickY = rect.top + (rect.height / 2) - pageRect.top;
      percentY = Math.max(2, Math.min(98, (clickY / pageRect.height) * 100));
    }

    setActivePopup({
      type: 'lugat',
      title: term.word,
      text: term.definition,
      origin: term.origin,
      rect,
      targetPageNum: clickedPageNum,
      targetPercentY: percentY,
    });
  }, [onSelectWord, pageNumber]);

  const handleArabicClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>, verseIdStr: string, arabicText: string) => {
    e.stopPropagation();
    const verseId = parseInt(verseIdStr, 10);
    if (isNaN(verseId)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pageElement = e.currentTarget.closest('[data-page-num]');
    const pageNumAttr = pageElement?.getAttribute('data-page-num');
    const clickedPageNum = pageNumAttr ? parseInt(pageNumAttr, 10) : pageNumber;
    let percentY = 30;
    if (pageElement) {
      const pageRect = pageElement.getBoundingClientRect();
      const clickY = rect.top + (rect.height / 2) - pageRect.top;
      percentY = Math.max(2, Math.min(98, (clickY / pageRect.height) * 100));
    }

    setActivePopup({
      type: 'meal',
      title: 'Ayet / Hadis Meali',
      text: '',
      loading: true,
      rect,
      targetPageNum: clickedPageNum,
      targetPercentY: percentY,
    });

    try {
      const fileIndex = Math.floor(verseId / 100);
      
      // Kullanıcının belirttiği tr.json, tr_0.json ... tr_67.json dosyalarını arayacağımız esnek yollar
      const paths = [
        `/meal/tr_${fileIndex}.json`,
        `/lugat/tr_${fileIndex}.json`,
        `/tr_${fileIndex}.json`,
        `/meal/tr.json`,
        `/lugat/tr.json`,
        `/tr.json`
      ];

      let mealText = '';
      let success = false;

      for (const path of paths) {
        try {
          const res = await fetch(path);
          if (res.ok) {
            const data = await res.json();
            
            // Farklı olası JSON yapılarını destekle (Array, Object, Key-Value)
            if (Array.isArray(data)) {
              // Obje dizisi ise arayalım
              const match = data.find((item: any) => {
                if (item && typeof item === 'object') {
                  return String(item.id) === String(verseId) || 
                         String(item.verse_id) === String(verseId) || 
                         String(item.key) === String(verseId) || 
                         String(item.index) === String(verseId);
                }
                return false;
              });
              if (match) {
                mealText = match.text || match.meal || match.translation || match.definition || JSON.stringify(match);
                success = true;
                break;
              }
              // Düz dizi ise doğrudan id veya modül indexi üzerinden bulalım
              if (data[verseId % 100] && typeof data[verseId % 100] === 'string') {
                mealText = data[verseId % 100];
                success = true;
                break;
              } else if (data[verseId] && typeof data[verseId] === 'string') {
                mealText = data[verseId];
                success = true;
                break;
              }
            } else if (data && typeof data === 'object') {
              // Obje haritası (Map) ise anahtarla sorgulayalım
              if (data[verseId]) {
                const val = data[verseId];
                mealText = typeof val === 'string' ? val : (val.text || val.meal || val.translation || JSON.stringify(val));
                success = true;
                break;
              }
              if (data[String(verseId)]) {
                const val = data[String(verseId)];
                mealText = typeof val === 'string' ? val : (val.text || val.meal || val.translation || JSON.stringify(val));
                success = true;
                break;
              }
            }
          }
        } catch (err) {
          // Bu yol başarısız, sıradakini dene
        }
      }

      if (!success) {
        mealText = `Ayet/Hadis Referans ID: ${verseId}\n\nLütfen /public/meal/ klasörü altına 'tr_0.json' - 'tr_67.json' meal dosyalarınızı yükleyin.\n\nArapça Metin: ${arabicText}`;
      }

      setActivePopup((prev) => {
        if (!prev || prev.rect !== rect) return prev;
        return {
          ...prev,
          text: mealText,
          loading: false,
        };
      });

    } catch (err) {
      setActivePopup((prev) => {
        if (!prev || prev.rect !== rect) return prev;
        return {
          ...prev,
          text: `Meal yüklenirken bir hata oluştu. (Referans ID: ${verseId})`,
          loading: false,
        };
      });
    }
  }, []);

  // Kaydırma (Scroll) durumunda popup'ı kapatarak görsel bozulmaları önleyelim
  useEffect(() => {
    const handleScroll = () => {
      setActivePopup(null);
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Otomatik Akış (Auto Scroll) State
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<0.1 | 0.15 | 0.2 | 0.25>(0.2); // 0.1: çok yavaş, 0.15: yavaş, 0.2: orta, 0.25: hızlı

  // Sayfaya Git (Go to Page) State
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInputStr, setPageInputStr] = useState('');

  const handlePageSubmit = () => {
    setIsEditingPage(false);
    const num = parseInt(pageInputStr, 10);
    const minPage = book.startingPage;
    const maxPage = book.startingPage + book.totalPages - 1;
    if (!isNaN(num)) {
      const targetPage = Math.max(minPage, Math.min(maxPage, num));
      onPageChange(targetPage);
    }
  };

  const lastSelectedPageRef = useRef<number>(pageNumber);
  const lastFihristClickTriggerRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Kitap veya sayfa değiştiğinde yükleme ve kaydırma mantığı (Tek ve Güçlü Birleştirilmiş Efekt - Race Condition Önler)
  useEffect(() => {
    const pageData = book.pages[pageNumber];
    
    // Eğer sayfa verisi henüz yüklenmediyse, listeyi temizle ve bekle
    if (!pageData) {
      if (loadedPages.length > 0) {
        setLoadedPages([]);
      }
      return;
    }

    const isExplicitFihristClick = fihristClickTrigger !== 0 && fihristClickTrigger !== lastFihristClickTriggerRef.current;
    if (isExplicitFihristClick) {
      lastFihristClickTriggerRef.current = fihristClickTrigger;
    }

    // Fihristten tıklandığında veya kitap ilk açıldığında her zaman temiz bir başlangıç yap ve sayfayı tam en tepeye getir
    if (isExplicitFihristClick) {
      const initialPages = [{ pageNum: pageNumber, data: pageData }];
      const maxPage = book.startingPage + book.totalPages - 1;
      
      for (let i = 1; i <= 2; i++) {
        const nextNum = pageNumber + i;
        if (nextNum <= maxPage) {
          const nextPageData = book.pages[nextNum];
          if (nextPageData) {
            initialPages.push({ pageNum: nextNum, data: nextPageData });
          }
        }
      }
      
      isProgrammaticScrollRef.current = true;
      setLoadedPages(initialPages);
      
      // Sayfayı anında en başa kaydır (Fihrist içeriği en tepeye gelsin)
      const scrollTimer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 0;
        }
      }, 50);

      setFocusPageNum(pageNumber);
      setFocusActive(true);
      const focusTimer = setTimeout(() => {
        setFocusActive(false);
      }, 2000);

      if (programmaticScrollTimeoutRef.current) {
        clearTimeout(programmaticScrollTimeoutRef.current);
      }
      programmaticScrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 800);

      lastSelectedPageRef.current = pageNumber;
      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(focusTimer);
        if (programmaticScrollTimeoutRef.current) {
          clearTimeout(programmaticScrollTimeoutRef.current);
        }
      };
    }

    const hasPage = loadedPages.some((p) => p.pageNum === pageNumber);

    // Eğer bu sayfa listede yoksa veya dışarıdan başka bir sayfaya geçildiyse
    if (!hasPage || lastSelectedPageRef.current !== pageNumber) {
      if (!isScrollingRef.current) {
        setFocusPageNum(pageNumber);
        setFocusActive(true);
        const focusTimer = setTimeout(() => {
          setFocusActive(false);
        }, 2000);

        if (!hasPage) {
          const firstLoadedPage = loadedPages.length > 0 ? loadedPages[0].pageNum : pageNumber;
          const diff = firstLoadedPage - pageNumber;

          const lastLoadedPage = loadedPages.length > 0 ? loadedPages[loadedPages.length - 1].pageNum : pageNumber;
          const forwardDiff = pageNumber - lastLoadedPage;

          if (diff > 0 && diff <= 12) {
            // Küçük fark geri: Aradaki sayfaları yükleyip yukarısına ekleyelim ve pürüzsüzce yukarı kaydıralım!
            const newPagesToPrepend: { pageNum: number; data: RisalePage }[] = [];
            for (let p = pageNumber; p < firstLoadedPage; p++) {
              const pData = book.pages[p];
              if (pData) {
                newPagesToPrepend.push({ pageNum: p, data: pData });
              }
            }

            if (newPagesToPrepend.length > 0) {
              const container = containerRef.current;
              if (container) {
                const previousScrollHeight = container.scrollHeight;
                const previousScrollTop = container.scrollTop;

                isProgrammaticScrollRef.current = true;
                setLoadedPages((prev) => {
                  const combined = [...newPagesToPrepend, ...prev];
                  const seen = new Set<number>();
                  return combined.filter((p) => {
                    if (seen.has(p.pageNum)) return false;
                    seen.add(p.pageNum);
                    return true;
                  });
                });

                // Render sonrası scroll ayarı ve yumuşak kaydırma
                requestAnimationFrame(() => {
                  const newScrollHeight = container.scrollHeight;
                  const heightDiff = newScrollHeight - previousScrollHeight;
                  
                  // Önce orijinal konumda tut
                  container.scrollTop = previousScrollTop + heightDiff;

                  // Hemen ardından hedef sayfaya yumuşakça kaydır
                  requestAnimationFrame(() => {
                    const targetElement = document.getElementById(`page-block-${pageNumber}`);
                    if (targetElement) {
                      const containerTop = container.getBoundingClientRect().top;
                      const elementTop = targetElement.getBoundingClientRect().top;
                      const targetScrollTop = container.scrollTop + (elementTop - containerTop);

                      container.scrollTo({
                        top: targetScrollTop,
                        behavior: 'smooth'
                      });

                      if (programmaticScrollTimeoutRef.current) {
                        clearTimeout(programmaticScrollTimeoutRef.current);
                      }
                      programmaticScrollTimeoutRef.current = setTimeout(() => {
                        isProgrammaticScrollRef.current = false;
                      }, 800);
                    } else {
                      isProgrammaticScrollRef.current = false;
                    }
                  });
                });
                return () => {
                  clearTimeout(focusTimer);
                  if (programmaticScrollTimeoutRef.current) {
                    clearTimeout(programmaticScrollTimeoutRef.current);
                  }
                };
              }
            }
          } else if (forwardDiff > 0 && forwardDiff <= 12) {
            // Küçük fark ileriye: Aradaki sayfaları sona ekleyelim ve aşağıya kaydıralım!
            const newPagesToAppend: { pageNum: number; data: RisalePage }[] = [];
            for (let p = lastLoadedPage + 1; p <= pageNumber; p++) {
              const pData = book.pages[p];
              if (pData) {
                newPagesToAppend.push({ pageNum: p, data: pData });
              }
            }

            if (newPagesToAppend.length > 0) {
              const container = containerRef.current;
              if (container) {
                isProgrammaticScrollRef.current = true;
                setLoadedPages((prev) => {
                  const combined = [...prev, ...newPagesToAppend];
                  const seen = new Set<number>();
                  return combined.filter((p) => {
                    if (seen.has(p.pageNum)) return false;
                    seen.add(p.pageNum);
                    return true;
                  });
                });

                requestAnimationFrame(() => {
                  const targetElement = document.getElementById(`page-block-${pageNumber}`);
                  if (targetElement) {
                    const containerTop = container.getBoundingClientRect().top;
                    const elementTop = targetElement.getBoundingClientRect().top;
                    const targetScrollTop = container.scrollTop + (elementTop - containerTop);

                    container.scrollTo({
                      top: targetScrollTop,
                      behavior: 'smooth'
                    });

                    if (programmaticScrollTimeoutRef.current) {
                      clearTimeout(programmaticScrollTimeoutRef.current);
                    }
                    programmaticScrollTimeoutRef.current = setTimeout(() => {
                      isProgrammaticScrollRef.current = false;
                    }, 800);
                  } else {
                    isProgrammaticScrollRef.current = false;
                  }
                });
                return () => {
                  clearTimeout(focusTimer);
                  if (programmaticScrollTimeoutRef.current) {
                    clearTimeout(programmaticScrollTimeoutRef.current);
                  }
                };
              }
            }
          }

          // Büyük fark veya başlangıç durumu: Listeyi bu sayfayla sıfırla, ama hemen peşinden sonraki 2 sayfayı da yükle ki kaydırma alanı oluşsun ve kilitlenmesin!
          const initialPages = [{ pageNum: pageNumber, data: pageData }];
          const maxPage = book.startingPage + book.totalPages - 1;
          
          for (let i = 1; i <= 2; i++) {
            const nextNum = pageNumber + i;
            if (nextNum <= maxPage) {
              const nextPageData = book.pages[nextNum];
              if (nextPageData) {
                initialPages.push({ pageNum: nextNum, data: nextPageData });
              }
            }
          }
          
          isProgrammaticScrollRef.current = true;
          setLoadedPages(initialPages);
          if (containerRef.current) {
            containerRef.current.scrollTop = 0;
          }

          if (programmaticScrollTimeoutRef.current) {
            clearTimeout(programmaticScrollTimeoutRef.current);
          }
          programmaticScrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 300);
        } else {
          // Sayfa zaten listede var ama dışarıdan tıklama ile seçildiyse (scroll yapmıyorken)
          const container = containerRef.current;
          const element = document.getElementById(`page-block-${pageNumber}`);
          if (container && element) {
            const containerTop = container.getBoundingClientRect().top;
            const elementTop = element.getBoundingClientRect().top;
            const targetScrollTop = container.scrollTop + (elementTop - containerTop);
            
            isProgrammaticScrollRef.current = true;
            container.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });

            if (programmaticScrollTimeoutRef.current) {
              clearTimeout(programmaticScrollTimeoutRef.current);
            }
            programmaticScrollTimeoutRef.current = setTimeout(() => {
              isProgrammaticScrollRef.current = false;
            }, 600); // Yumuşak kaydırmanın tamamlanması için daha uzun bir süre
          }
        }

        return () => {
          clearTimeout(focusTimer);
          if (programmaticScrollTimeoutRef.current) {
            clearTimeout(programmaticScrollTimeoutRef.current);
          }
        };
      } else {
        // Scroll yaparken sayfa değiştiğinde listeyi güncelliyoruz ama kaydırma yapmıyoruz
        if (!hasPage) {
          const initialPages = [{ pageNum: pageNumber, data: pageData }];
          const maxPage = book.startingPage + book.totalPages - 1;
          
          for (let i = 1; i <= 2; i++) {
            const nextNum = pageNumber + i;
            if (nextNum <= maxPage) {
              const nextPageData = book.pages[nextNum];
              if (nextPageData) {
                initialPages.push({ pageNum: nextNum, data: nextPageData });
              }
            }
          }
          
          isProgrammaticScrollRef.current = true;
          setLoadedPages(initialPages);
          if (containerRef.current) {
            containerRef.current.scrollTop = 0;
          }

          if (programmaticScrollTimeoutRef.current) {
            clearTimeout(programmaticScrollTimeoutRef.current);
          }
          programmaticScrollTimeoutRef.current = setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 800);
        }
      }
    }

    lastSelectedPageRef.current = pageNumber;
  }, [pageNumber, book.id, book.pages, book.pages[pageNumber], fihristClickTrigger]);

  // Önceki sayfayı yükleme fonksiyonu
  const loadPrevPage = () => {
    if (loadedPages.length === 0) return;

    const firstLoaded = loadedPages[0];
    const prevNum = firstLoaded.pageNum - 1;
    let minPage = book.startingPage;
    
    // Mektubat ve Lemalar için başlangıç sayfası 5'tir
    if (book.id === 'mektubat' || book.id === 'lemalar') {
      minPage = 5;
    }

    if (prevNum >= minPage) {
      const prevPageData = book.pages[prevNum];
      if (prevPageData) {
        const container = containerRef.current;
        if (container) {
          const previousScrollHeight = container.scrollHeight;
          const previousScrollTop = container.scrollTop;

          setLoadedPages((prev) => {
            const exists = prev.some((p) => p.pageNum === prevNum);
            if (exists) return prev;
            return [{ pageNum: prevNum, data: prevPageData }, ...prev];
          });

          requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            const heightDiff = newScrollHeight - previousScrollHeight;
            if (heightDiff > 0) {
              container.scrollTop = previousScrollTop + heightDiff;
            }
          });
        }
      }
    }
  };

  // Sonraki sayfayı yükleme fonksiyonu
  const loadNextPage = () => {
    if (loadedPages.length === 0) return;

    const lastLoaded = loadedPages[loadedPages.length - 1];
    const nextNum = lastLoaded.pageNum + 1;
    const maxPage = book.startingPage + book.totalPages - 1;

    if (nextNum <= maxPage) {
      const nextPageData = book.pages[nextNum];
      if (nextPageData) {
        setLoadedPages((prev) => {
          const exists = prev.some((p) => p.pageNum === nextNum);
          if (exists) return prev;
          return [...prev, { pageNum: nextNum, data: nextPageData }];
        });
      }
    }
  };

  // Scroll takibi, sonsuz kaydırma ve aktif sayfa tespiti
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Eğer yapay (programlı) bir kaydırma yapılıyorsa, görünür sayfa hesaplamasını pas geçelim
      if (isProgrammaticScrollRef.current) {
        return;
      }

      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 150);

      // 1. Sona yaklaşıldığında sonraki sayfayı yükle (sonsuz kaydırma)
      const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (scrollBottom < 1000) { // Sona 1000px kala yüklemeye başla (daha akıcı geçiş için)
        loadNextPage();
      }

      // 1.5. Üste yaklaşıldığında önceki sayfayı yükle (yukarı doğru sonsuz kaydırma)
      if (container.scrollTop < 300) {
        loadPrevPage();
      }

      // 2. Görünürdeki aktif sayfayı bul
      const pageElements = container.querySelectorAll('[data-page-num]');
      let currentVisiblePage = pageNumber;
      const containerTop = container.getBoundingClientRect().top;
      let minDiff = Infinity;

      pageElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Sayfanın üst kısmının container'ın üst kısmına mesafesi
        const diff = Math.abs(rect.top - containerTop);
        if (diff < minDiff) {
          minDiff = diff;
          const pNum = parseInt(el.getAttribute('data-page-num') || '', 10);
          if (!isNaN(pNum)) {
            currentVisiblePage = pNum;
          }
        }
      });

      if (currentVisiblePage !== pageNumber) {
        onPageChange(currentVisiblePage);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [loadedPages, pageNumber, book.id]);

  // Otomatik Akış (Auto Scroll) Logic
  useEffect(() => {
    if (!isAutoScrolling) return;

    let animationFrameId: number;
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    let scrollY = scrollContainer.scrollTop;
    let lastProgrammaticScroll = Math.round(scrollY);

    // Manual scroll sync: if the user scrolls, update our internal accumulator
    const handleScrollSync = () => {
      const currentScrollTop = scrollContainer.scrollTop;
      // If the scroll is exactly what we programmatically set, or within 1.5 pixels, it's ours.
      if (Math.abs(currentScrollTop - lastProgrammaticScroll) <= 1.5) {
        return;
      }
      // Otherwise, the user scrolled manually!
      scrollY = currentScrollTop;
      lastProgrammaticScroll = currentScrollTop;
    };
    scrollContainer.addEventListener('scroll', handleScrollSync, { passive: true });

    let lastTime = performance.now();
    const scrollStep = (time: number) => {
      if (!isAutoScrolling) return;

      const delta = time - lastTime;
      lastTime = time;

      // Calculate speed factor (base pixels per frame at 60fps)
      let speedFactor = 0.2;
      if (scrollSpeed === 0.1) speedFactor = 0.1;
      else if (scrollSpeed === 0.15) speedFactor = 0.15;
      else if (scrollSpeed === 0.25) speedFactor = 0.25;

      // Adjust speed factor slightly based on frame duration to be independent of refresh rate
      // 16.67ms is 60fps baseline
      const frameRatio = Math.min(delta / 16.67, 3); // cap it so it doesn't jump too far on lag
      scrollY += speedFactor * frameRatio;
      
      lastProgrammaticScroll = Math.round(scrollY);
      scrollContainer.scrollTop = lastProgrammaticScroll;

      animationFrameId = requestAnimationFrame(scrollStep);
    };

    animationFrameId = requestAnimationFrame(scrollStep);
    return () => {
      cancelAnimationFrame(animationFrameId);
      scrollContainer.removeEventListener('scroll', handleScrollSync);
    };
  }, [isAutoScrolling, scrollSpeed]);

  const currentPageData: RisalePage | undefined = book.pages[pageNumber];
  
  // Yer imi durumu
  const isBookmarked = bookmarks.some((b) => b.bookId === book.id && b.page === pageNumber);

  // Okuma ilerleme yüzdesi
  const progressPercent = Math.round(
    ((pageNumber - book.startingPage + 1) / book.totalPages) * 100
  );

  // Bu sayfada başlayan bir fihrist bölümü var mı?
  const currentSection = book.sections.find((s) => s.startPage === pageNumber);

  // Dinamik Renk Sınıfları (Temaya göre yüksek kontrast)
  const textThemeClass = 
    preferences.theme === 'dark'
      ? 'text-stone-200 font-medium'
      : preferences.theme === 'sepia'
      ? 'text-[#2c2217] font-medium'
      : preferences.theme === 'saman'
      ? 'text-[#332913] font-medium'
      : preferences.theme === 'green'
      ? 'text-[#142918] font-medium'
      : preferences.theme === 'gray'
      ? 'text-[#1e252b] font-medium'
      : 'text-[#27211a] font-medium';

  const titleThemeClass = 
    preferences.theme === 'dark'
      ? 'text-stone-100 font-bold'
      : preferences.theme === 'sepia'
      ? 'text-[#2c2217] font-bold'
      : preferences.theme === 'saman'
      ? 'text-[#332913] font-bold'
      : preferences.theme === 'green'
      ? 'text-[#142918] font-bold'
      : preferences.theme === 'gray'
      ? 'text-[#1e252b] font-bold'
      : 'text-[#1c1917] font-bold';

  const wordColorClass = 
    preferences.theme === 'dark'
      ? 'text-stone-300 hover:text-orange-400 border-b border-stone-300/20 hover:border-orange-400'
      : preferences.theme === 'sepia'
      ? 'text-[#2c2217] hover:text-amber-700 border-b border-[#2c2217]/20 hover:border-amber-700'
      : preferences.theme === 'saman'
      ? 'text-[#332913] hover:text-amber-800 border-b border-[#332913]/20 hover:border-amber-800'
      : preferences.theme === 'green'
      ? 'text-[#142918] hover:text-emerald-700 border-b border-[#142918]/20 hover:border-emerald-700'
      : preferences.theme === 'gray'
      ? 'text-[#1e252b] hover:text-blue-700 border-b border-[#1e252b]/20 hover:border-blue-700'
      : 'text-[#27211a] hover:text-sepia-accent border-b border-[#27211a]/20 hover:border-sepia-accent';

  const headerThemeClass = 
    preferences.theme === 'dark'
      ? 'bg-[#181614]/85 border-stone-800 text-stone-200'
      : preferences.theme === 'sepia'
      ? 'bg-[#f5f2ed]/85 border-sepia-300 text-[#2c2621]'
      : preferences.theme === 'saman'
      ? 'bg-[#eee0bb]/85 border-[#d0c091] text-[#332913]'
      : preferences.theme === 'green'
      ? 'bg-[#e9f2e9]/85 border-[#c3d1c3] text-[#142918]'
      : preferences.theme === 'gray'
      ? 'bg-[#eff2f4]/85 border-[#ccd2d7] text-[#1e252b]'
      : 'bg-[#fdfcf9]/85 border-stone-200 text-stone-950';

  // Yazı boyutu sınıfları
  const fontSizeClasses = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
    '2xl': 'text-2xl md:text-3xl',
  };

  // Satır yüksekliği sınıfları
  const lineHeightClasses = {
    tight: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  };

  // Yazı tipi sınıfları
  const fontStyleClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
  };

  // Sayfalar arasında gezinme (Sürekli kaydırma olduğu için oklar kaldırıldı)
  const totalPages = book.totalPages;

  const containerBgClass = 
    preferences.theme === 'dark' 
      ? 'bg-[#12100e]' 
      : preferences.theme === 'sepia' 
      ? 'bg-[#d8ccb6]' 
      : preferences.theme === 'saman'
      ? 'bg-[#d0c091]'
      : preferences.theme === 'green'
      ? 'bg-[#c3d1c3]'
      : preferences.theme === 'gray'
      ? 'bg-[#ccd2d7]'
      : 'bg-[#dfd4be]';

  const pageBgClass = 
    preferences.theme === 'dark'
      ? 'bg-[#1c1917]'
      : preferences.theme === 'sepia'
      ? 'bg-[#f5e9d3]'
      : preferences.theme === 'saman'
      ? 'bg-[#ebdcae]'
      : preferences.theme === 'green'
      ? 'bg-[#e3eee3]'
      : preferences.theme === 'gray'
      ? 'bg-[#e8ecef]'
      : 'bg-[#fdfcf9]';

  return (
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Kitap & Sayfa Üst Bilgi Barı */}
      <div className={`flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 border-b backdrop-blur-md z-10 relative ${headerThemeClass}`}>
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-full border text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0 ${
                sidebarOpen
                  ? 'border-sepia-accent bg-sepia-accent/10 text-sepia-accent'
                  : 'border-sepia-300 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-sepia-200/50 dark:hover:bg-stone-800'
              }`}
              title={sidebarOpen ? "Fihristi Kapat (Tam Ekran Okuma)" : "Fihrist Paneli Aç"}
            >
              <Menu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Fihrist</span>
            </button>
          )}
          {onGoToLibrary && (
            <button
              onClick={onGoToLibrary}
              className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-full border border-sepia-300 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-sepia-200/50 dark:hover:bg-stone-800 text-[10px] font-sans font-bold uppercase tracking-wider transition-all cursor-pointer flex-shrink-0"
              title="Kütüphaneye Geri Dön"
            >
              <Library className="w-3 h-3 text-sepia-accent" />
              <span className="hidden sm:inline">Kütüphane</span>
            </button>
          )}
          <BookOpen className="w-4 h-4 text-sepia-accent hidden sm:inline flex-shrink-0" />
          <span className={`font-serif font-extrabold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none ${titleThemeClass}`}>
            {book.title}
          </span>
          {isEditingPage ? (
            <div className="flex items-center gap-1 sm:gap-1.5 ml-1 flex-shrink-0">
              <span className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 font-mono">/ s.</span>
              <input
                type="number"
                value={pageInputStr}
                onChange={(e) => setPageInputStr(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePageSubmit();
                  } else if (e.key === 'Escape') {
                    setIsEditingPage(false);
                  }
                }}
                className="w-12 sm:w-16 h-6 px-1 text-center text-xs font-mono border border-sepia-accent/30 dark:border-stone-700 rounded bg-[#fdfcf9] dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:border-sepia-accent focus:ring-1 focus:ring-sepia-accent/50"
                placeholder={`${book.startingPage}`}
                autoFocus
                onBlur={handlePageSubmit}
                min={book.startingPage}
                max={book.startingPage + book.totalPages - 1}
              />
              <button
                onClick={handlePageSubmit}
                className="px-2 py-0.5 text-[9px] font-sans font-bold uppercase tracking-wider rounded bg-sepia-accent text-stone-950 hover:bg-sepia-accent/90 transition-all cursor-pointer flex-shrink-0"
              >
                Git
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsEditingPage(true);
                setPageInputStr(pageNumber.toString());
              }}
              className="hover:bg-sepia-200/50 dark:hover:bg-stone-800/60 px-1.5 py-1 rounded cursor-pointer transition-colors duration-200 font-mono text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1 flex-shrink-0"
              title="Sayfaya gitmek için tıklayın"
            >
              / s. {pageNumber}
              <span className="text-[8px] sm:text-[9px] opacity-40 font-sans font-normal border border-stone-400/30 rounded px-1 scale-90 sm:inline-block hidden">SAYFAYA GİT</span>
            </button>
          )}
        </div>

        {/* Masaüstü Ortalanmış Otomatik Akış Kumandası */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 md:gap-2 z-20">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isAutoScrolling
                ? 'bg-sepia-accent text-stone-950 border border-sepia-accent'
                : 'border border-sepia-300 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white/40 dark:bg-stone-900/40 hover:bg-sepia-200/50'
            }`}
            title={isAutoScrolling ? "Otomatik akışı durdur" : "Otomatik akışı başlat"}
          >
            {isAutoScrolling ? (
              <>
                <Pause className="w-3 h-3 text-stone-950" />
                <span className="text-[9px] tracking-widest text-stone-950">Akıyor</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span className="text-[9px] tracking-widest">Akıt</span>
              </>
            )}
          </button>

          {isAutoScrolling && (
            <div className="flex items-center bg-sepia-200/50 dark:bg-stone-900 border border-sepia-300 dark:border-stone-800 p-0.5 rounded-full shadow-xs gap-0.5">
              {([0.1, 0.15, 0.2, 0.25] as const).map((speed) => (
                <button
                   key={speed}
                   onClick={() => setScrollSpeed(speed)}
                   className={`px-2.5 py-0.5 text-[8px] font-sans font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                     scrollSpeed === speed
                       ? 'bg-sepia-accent text-stone-950 shadow-xs'
                       : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                   }`}
                >
                  {speed.toFixed(2)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Panel: Yer İmi ve Mobil Otomatik Akış Kumandası */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Mobil Akış Kumandası (Sadece mobilde görünür, asla üst üste binmez) */}
          <div className="md:hidden flex items-center gap-1 max-w-[190px]">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center justify-center w-7 h-7 rounded-full border transition-all cursor-pointer shrink-0 ${
                isAutoScrolling
                  ? 'bg-sepia-accent text-stone-950 border-sepia-accent'
                  : 'border-sepia-300 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white/45 dark:bg-stone-900/45 hover:bg-sepia-200/30'
              }`}
              title={isAutoScrolling ? "Otomatik akışı durdur" : "Otomatik akışı başlat"}
            >
              {isAutoScrolling ? (
                <Pause className="w-3 h-3 text-stone-950" />
              ) : (
                <Play className="w-3 h-3 fill-current ml-0.5" />
              )}
            </button>

            {isAutoScrolling && (
              <div className="flex items-center gap-0.5 rounded-full border border-sepia-300/70 dark:border-stone-700/80 bg-white/70 dark:bg-stone-900/70 p-0.5 overflow-hidden">
                {([0.1, 0.15, 0.2, 0.25] as const).map((speed) => (
                  <button
                    key={String(speed)}
                    onClick={() => setScrollSpeed(speed)}
                    className={`min-w-[2.2rem] px-1 py-0.5 text-[8px] font-sans font-bold rounded-full transition-all cursor-pointer ${
                      scrollSpeed === speed
                        ? 'bg-sepia-accent text-stone-950 shadow-xs'
                        : 'text-stone-600 dark:text-stone-300 hover:bg-sepia-200/40 dark:hover:bg-stone-800'
                    }`}
                    title={`Akış hızı: ${String(speed)}`}
                  >
                    {String(speed)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Okuma İşaretçisi (Gezen İşaretçi) Butonu */}
          <button
            onClick={togglePointer}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              showPointer
                ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'border-sepia-300 dark:border-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900/50'
            }`}
            title={showPointer ? "Okuma kılavuzunu kapat" : "Okuma kılavuzunu aç (Gezen İşaretçi)"}
          >
            <Pin className={`w-4 h-4 ${showPointer ? 'rotate-45 text-amber-600 dark:text-amber-400' : ''} transition-transform duration-300`} />
          </button>

          {/* Yer İmi Butonu */}
          <button
            onClick={() => onToggleBookmark(book.id, pageNumber)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              isBookmarked
                ? 'border-sepia-accent bg-sepia-accent/10 text-sepia-accent'
                : 'border-sepia-300 dark:border-stone-800 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-900/50'
            }`}
            title={isBookmarked ? "Kayıtlı sayfayı kaldır" : "Kaldığım yeri kaydet"}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dikey Sanatsal Etiket (Vertical Label for Artistic Flair) */}
      <div
        className="hidden xl:flex absolute left-4 top-1/2 -translate-y-1/2 -rotate-180 items-center pointer-events-none select-none z-10"
        style={{ writingMode: 'vertical-rl' }}
      >
        <span className={`text-[9px] uppercase tracking-[0.4em] opacity-25 font-sans dark:text-stone-500 font-medium ${titleThemeClass}`}>
          Tefekkür ve Mütalaa Modu — Sayfa {String(pageNumber).padStart(3, '0')}
        </span>
      </div>

      {/* Okuma Alanı (Lazy Loaded Frame - Continuous Scroll) */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto px-4 py-8 md:py-12 no-scrollbar scroll-smooth relative transition-colors duration-300 ${containerBgClass}`}
      >
        {loadedPages.length > 0 ? (
          <div className="w-full max-w-[820px] mx-auto flex flex-col gap-12 relative pb-24 min-h-full">
            {loadedPages.map(({ pageNum, data }) => {
              const isActive = pageNum === pageNumber;
              const isFocused = focusActive && focusPageNum === pageNum;

              const pageSectionTitle = (() => {
                if (!sections || sections.length === 0) return null;
                const activeSections = sections.filter((s) => s.startPage <= pageNum);
                if (activeSections.length === 0) return null;
                const sorted = [...activeSections].sort((a, b) => b.startPage - a.startPage);
                const activeSec = sorted[0];
                if (activeSec.parentTitles && activeSec.parentTitles.length > 0) {
                  return [...activeSec.parentTitles, activeSec.title].join(', ');
                }
                return activeSec.title;
              })();

              return (
                <div
                  key={pageNum}
                  id={`page-block-${pageNum}`}
                  data-page-num={pageNum}
                  className={`relative ${pageBgClass} border border-sepia-300/40 dark:border-stone-850/80 rounded-lg shadow-[0_12px_45px_rgba(0,0,0,0.08)] dark:shadow-[0_16px_50px_rgba(0,0,0,0.35)] pb-16 pt-12 px-6 sm:px-12 md:px-16 transition-all duration-300 flex flex-col ${
                    isActive 
                      ? 'ring-1 ring-sepia-accent/25 dark:ring-amber-500/15 scale-[1.002]' 
                      : 'opacity-90 dark:opacity-85'
                  }`}
                >
                  {/* Sol Cilt Payı / Derinlik Gölgesi (Book Spine Gutter Shadow) */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-stone-900/[0.06] dark:from-stone-950/40 to-transparent pointer-events-none rounded-l-lg z-10" />
                  
                  {/* Sağ Kitap Yaprağı Kenarı Efekti (Single Leaf border accent) */}
                  <div className="absolute right-0 top-0 bottom-0 w-[1.5px] bg-stone-950/[0.05] dark:bg-stone-100/5 pointer-events-none rounded-r-lg z-10" />

                  {/* Okuma İşaretçisi (Gezen İşaretçi) */}
                  {isActive && showPointer && (
                    <div
                      style={{ top: `${pointerY}%` }}
                      className="absolute left-0 right-0 h-[2px] bg-amber-500/80 dark:bg-amber-400/80 z-20 pointer-events-auto flex items-center justify-between group transition-[top] duration-75 select-none"
                    >
                      {/* Sol tarafta şık sürükleme kulpu */}
                      <div 
                        className="absolute -left-5 md:-left-7 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-500 text-stone-950 p-2 rounded-l-md shadow-md cursor-ns-resize flex items-center justify-center transition-all z-30 active:scale-95"
                        title="İşaretçiyi dikey kaydır (Sürükle)"
                        onMouseDown={handleDragStart}
                        onTouchStart={handleDragStart}
                      >
                        <div className="flex flex-col gap-[3px] items-center px-0.5 pointer-events-none">
                          <span className="w-3 h-[2px] bg-stone-900 rounded-full" />
                          <span className="w-3 h-[2px] bg-stone-900 rounded-full" />
                          <span className="w-3 h-[2px] bg-stone-900 rounded-full" />
                        </div>
                      </div>

                      {/* Arka planda uzanan okuma şeridi vurgusu */}
                      <div className="absolute inset-x-0 h-8 -translate-y-4 bg-amber-400/10 dark:bg-amber-400/15 pointer-events-none blur-sm" />

                      {/* Sağ tarafta Çok Fonksiyonlu Kontrol ve Sürükleme Kulpu */}
                      <div className="absolute -right-5 md:-right-7 top-1/2 -translate-y-1/2 flex flex-col items-center bg-amber-500 dark:bg-amber-400 text-stone-950 rounded-r-md shadow-md z-30 select-none">
                        {/* Yukarı İnce Ayar */}
                        <button 
                          onClick={() => adjustPointer(-1.0)} 
                          className="p-1 hover:bg-stone-900/10 active:scale-75 rounded-t-md transition-all cursor-pointer flex items-center justify-center border-b border-stone-900/10 w-full"
                          title="Yukarı İnce Ayar (-1%)"
                        >
                          <ChevronLeft className="w-4 h-4 rotate-90 stroke-[2.5]" />
                        </button>

                        {/* Sürükleme Bölgesi */}
                        <div 
                          className="w-full py-2 hover:bg-stone-900/10 cursor-ns-resize flex flex-col gap-[3px] items-center justify-center border-b border-stone-900/10"
                          title="İşaretçiyi dikey kaydır (Sürükle)"
                          onMouseDown={handleDragStart}
                          onTouchStart={handleDragStart}
                        >
                          <span className="w-3 h-[1.5px] bg-stone-900 rounded-full" />
                          <span className="w-3 h-[1.5px] bg-stone-900 rounded-full" />
                          <span className="w-3 h-[1.5px] bg-stone-900 rounded-full" />
                        </div>

                        {/* Aşağı İnce Ayar */}
                        <button 
                          onClick={() => adjustPointer(1.0)} 
                          className="p-1 hover:bg-stone-900/10 active:scale-75 rounded-b-md transition-all cursor-pointer flex items-center justify-center w-full"
                          title="Aşağı İnce Ayar (+1%)"
                        >
                          <ChevronLeft className="w-4 h-4 -rotate-90 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sayfa Başlığı ve Çizgisi (Book Page Header) */}
                  <div className={`flex flex-col gap-2 mb-10 select-none transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40 dark:opacity-50'}`}>
                    <div className="flex items-center justify-between text-[11px] font-sans font-semibold tracking-wider text-sepia-accent/80 dark:text-stone-400">
                      <span className="truncate max-w-[180px] md:max-w-[280px]">{book.title}</span>
                      <span className="font-serif italic font-medium text-sepia-accent dark:text-amber-500/80">✦</span>
                      <span className="truncate max-w-[180px] md:max-w-[280px]">{pageSectionTitle || book.title}</span>
                    </div>
                    {/* Çift Çizgi Efekti (Kitap Sayfası Hissi için üstte bir kalın bir ince çizgi) */}
                    <div className="flex flex-col gap-[2px]">
                      <div className="h-[1.5px] bg-sepia-accent/35 dark:bg-stone-700/60 w-full" />
                      <div className="h-[0.5px] bg-sepia-accent/15 dark:bg-stone-800/40 w-full scale-x-95 origin-center" />
                    </div>
                  </div>

                  {/* Sayfa Metni */}
                  <ReadingPageContent
                    text={data.text}
                    preferences={preferences}
                    selectedWord={selectedWord}
                    searchQuery={searchQuery}
                    dictionary={dictionary}
                    wordColorClass={wordColorClass}
                    headingColorClass={preferences.theme === 'dark' ? 'text-stone-100' : preferences.theme === 'sepia' ? 'text-[#2c2217]' : preferences.theme === 'saman' ? 'text-[#332913]' : preferences.theme === 'green' ? 'text-[#142918]' : preferences.theme === 'gray' ? 'text-[#1e252b]' : 'text-[#27211a]'}
                    onWordClick={handleWordClick}
                    onArabicClick={handleArabicClick}
                    fontSizeClass={fontSizeClasses[preferences.fontSize]}
                    lineHeightClass={lineHeightClasses[preferences.lineHeight]}
                    fontStyleClass={fontStyleClasses[preferences.fontStyle]}
                    textThemeClass={textThemeClass}
                  />

                  {/* Haşiyeler (Footnotes) - Floating/Callout Style */}
                  {preferences.showFootnotes && data.footnotes.length > 0 && (
                    <div className="mt-12 pt-6">
                      <div className="space-y-4">
                        {data.footnotes.map((fn) => (
                          <div
                            key={fn.id}
                            className="py-3 px-1 border-l-2 border-sepia-accent/30 pl-4 transition-all"
                          >
                            <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-sepia-accent block mb-1">
                              Haşiye / Not {fn.marker}
                            </span>
                            <p className="text-xs leading-relaxed italic font-serif text-stone-600 dark:text-stone-400 font-medium">
                              {fn.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sayfa Altlığı ve Çizgisi (Book Page Footer) */}
                  <div className={`flex flex-col gap-4 mt-12 select-none transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-40 dark:opacity-50'}`}>
                    {/* İnce Çizgi ve Süsleme */}
                    <div className="h-[1px] bg-sepia-accent/15 dark:bg-stone-800/60 w-full" />
                    
                    {/* Sayfa Numarası Emblemi ve Fihrist Bilgisi */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-2 text-xs font-sans text-sepia-accent/80 dark:text-stone-400">
                      <span className="hidden sm:inline opacity-60 font-semibold">{book.title}</span>
                      <span className="px-4 py-1.5 rounded-full border border-sepia-accent/30 dark:border-stone-700/80 text-sm font-sans tracking-wide text-sepia-accent dark:text-stone-300 bg-sepia-200/40 dark:bg-stone-900 font-bold shadow-sm">
                        Sayfa {pageNum}
                      </span>
                      <span className="text-right truncate max-w-[280px] font-semibold" title={pageSectionTitle || ''}>
                        {pageSectionTitle || ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-sepia-accent/10 flex items-center justify-center text-sepia-accent mb-4">
              <BookOpen className="w-8 h-8 animate-pulse" />
            </div>
            <h4 className={`font-display font-bold text-lg mb-2 ${titleThemeClass}`}>
              Sayfa Yükleniyor
            </h4>
            <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed font-sans">
              Büyük metinler yüksek performanslı ve hızlı okuma için sayfa sayfa (lazy loading) yüklenmektedir.
            </p>
          </div>
        )}
      </div>

      {/* Alt Navigasyon (Artistic Progress Footer Context Bar - Oklar Kaldırıldı) */}
      <footer className="h-20 bg-transparent flex items-center px-8 justify-between select-none">
        {/* Okuma İlerlemesi Progress Bar */}
        <div className="flex-1 max-w-xl">
          <div className="flex justify-between text-[9px] font-sans uppercase tracking-wider opacity-60 mb-1 text-sepia-accent/80 dark:text-stone-400">
            <span>Süre: {formatReadingTime(readingSeconds)}</span>
          </div>
          <div className="flex justify-between text-[10px] font-sans uppercase tracking-widest opacity-40 mb-2 dark:text-stone-400">
            <span>Okuma İlerlemesi</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-[1px] bg-sepia-300 dark:bg-stone-800 relative">
            <div
              className="h-full bg-sepia-accent transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Son Durak Bilgisi */}
        <div className="flex items-center gap-4 pl-6 md:pl-12 ml-6">
          <div className="text-right">
            <div className="text-[10px] font-sans uppercase tracking-widest opacity-40 dark:text-stone-400">
              Şu Anki Konum
            </div>
            <div className={`text-xs font-bold font-sans ${titleThemeClass}`}>
              {book.title} / S. {pageNumber}
            </div>
            {currentSectionTitle && (
              <div className="text-[10px] font-sans mt-0.5 text-sepia-accent/80 dark:text-stone-400 truncate max-w-[180px]" title={currentSectionTitle}>
                {currentSectionTitle}
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Yüzen Lügat ve Meal Popup Paneli */}
      {activePopup && activePopup.rect && (
        <>
          {/* Popup dışına tıklandığında kapatmak için transparan perde */}
          <div
            className="fixed inset-0 z-40 bg-black/5 dark:bg-black/10 cursor-default"
            onClick={() => setActivePopup(null)}
          />

          {(() => {
            const { style, placement } = getPopupStyle(activePopup.rect);
            return (
              <div
                style={style}
                className="animate-in fade-in zoom-in-95 duration-200 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-sepia-300 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[380px] pointer-events-auto transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-sepia-100/50 dark:bg-stone-950/50 border-b border-sepia-300/40 dark:border-stone-850/60">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-serif font-extrabold text-sm sm:text-base text-sepia-accent truncate tracking-tight">
                      {activePopup.title}
                    </span>
                    {activePopup.origin && (
                      <span className="text-[10px] font-mono opacity-70 bg-sepia-200 dark:bg-stone-850 px-2.5 py-0.5 rounded-full text-stone-700 dark:text-stone-300">
                        {activePopup.origin}
                      </span>
                    )}
                    {activePopup.type === 'meal' && (
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                        Meali Şerif
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActivePopup(null)}
                    className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-all cursor-pointer hover:bg-sepia-200/50 dark:hover:bg-stone-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 overflow-y-auto text-sm sm:text-[15px] md:text-[16px] leading-relaxed text-stone-850 dark:text-stone-150 font-serif">
                  {activePopup.loading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <div className="w-6 h-6 border-2 border-sepia-accent border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-sans text-stone-400 animate-pulse">Meal yükleniyor...</span>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line leading-relaxed tracking-wide text-stone-800 dark:text-stone-100 font-serif selection:bg-sepia-accent/20">
                      {activePopup.text}
                    </p>
                  )}
                </div>

                {/* Popup Aksiyon Butonu Footer Alanı */}
                {!activePopup.loading && activePopup.targetPageNum && activePopup.targetPercentY !== undefined && (
                  <div className="px-5 py-3 bg-sepia-100/30 dark:bg-stone-950/35 border-t border-sepia-300/30 dark:border-stone-850/40 flex items-center justify-end">
                    <button
                      onClick={() => {
                        const targetPage = activePopup.targetPageNum!;
                        const targetY = activePopup.targetPercentY!;

                        // Eğer işaretçi başka sayfadaysa o sayfaya geçiş yapalım
                        if (targetPage !== pageNumber) {
                          onPageChange(targetPage);
                        }
                        
                        setPointerY(parseFloat(targetY.toFixed(1)));
                        setShowPointer(true);
                        savePointerState(targetY, true);
                        setActivePopup(null);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-600 text-stone-950 text-xs font-sans font-bold rounded-full shadow-md transition-all cursor-pointer active:scale-95"
                      title="Okuma kılavuzunu tam bu satırın üzerine sabitle"
                    >
                      <Pin className="w-3.5 h-3.5 rotate-45 text-stone-950" />
                      <span>Buraya Raptiyele (Kılavuz Sabitle)</span>
                    </button>
                  </div>
                )}

                {/* Süsleme Çizgisi */}
                <div className="h-1 bg-gradient-to-r from-sepia-accent/50 via-sepia-accent to-sepia-accent/50" />
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default ReadingView;


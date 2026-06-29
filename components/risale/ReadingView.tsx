"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { RisaleBook, UserPreferences, RisalePage, DictionaryTerm } from './types';
import { ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, HelpCircle, BookOpen, Play, Pause, Square, Library, Menu, X } from 'lucide-react';
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const programmaticScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loadedPages, setLoadedPages] = useState<{ pageNum: number; data: RisalePage }[]>([]);
  
  // Fihrist/Yer iminden gelen odaklanma/zoom durumları
  const [focusPageNum, setFocusPageNum] = useState<number | null>(null);
  const [focusActive, setFocusActive] = useState(false);
  
  // Yüzen Popup (Floating Tooltip/Popover) State
  const [activePopup, setActivePopup] = useState<{
    type: 'lugat' | 'meal';
    title: string;
    text: string;
    origin?: string;
    loading?: boolean;
    rect: DOMRect | null;
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
    setActivePopup({
      type: 'lugat',
      title: term.word,
      text: term.definition,
      origin: term.origin,
      rect,
    });
  }, [onSelectWord]);

  const handleArabicClick = useCallback(async (e: React.MouseEvent<HTMLDivElement>, verseIdStr: string, arabicText: string) => {
    e.stopPropagation();
    const verseId = parseInt(verseIdStr, 10);
    if (isNaN(verseId)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setActivePopup({
      type: 'meal',
      title: 'Ayet / Hadis Meali',
      text: '',
      loading: true,
      rect,
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
  const [scrollSpeed, setScrollSpeed] = useState<1 | 1.25 | 1.5 | 2>(1); // 1: yavaş, 1.25: orta-yavaş, 1.5: orta, 2: hızlı

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

    // Manual scroll sync: if the user scrolls, update our internal accumulator
    const handleScrollSync = () => {
      scrollY = scrollContainer.scrollTop;
    };
    scrollContainer.addEventListener('scroll', handleScrollSync, { passive: true });

    let lastTime = performance.now();
    const scrollStep = (time: number) => {
      if (!isAutoScrolling) return;

      const delta = time - lastTime;
      // Calculate speed factor (base pixels per frame at 60fps)
      let speedFactor = 0.25; // 0.25 px (Ergonomik yavaş okuma)
      if (scrollSpeed === 1.25) speedFactor = 0.65; // 1.25x
      else if (scrollSpeed === 1.5) speedFactor = 0.9; // 1.5x
      else if (scrollSpeed === 2) speedFactor = 1.4; // 2x

      // Adjust speed factor slightly based on frame duration to be independent of refresh rate
      // 16.67ms is 60fps baseline
      const frameRatio = Math.min(delta / 16.67, 3); // cap it so it doesn't jump too far on lag
      scrollY += speedFactor * frameRatio;
      
      // Temporary remove the sync listener during programmatic update to avoid feedback loop
      scrollContainer.removeEventListener('scroll', handleScrollSync);
      scrollContainer.scrollTop = Math.round(scrollY);
      scrollContainer.addEventListener('scroll', handleScrollSync, { passive: true });

      lastTime = time;
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
      : 'text-[#27211a] font-medium';

  const titleThemeClass = 
    preferences.theme === 'dark'
      ? 'text-stone-100 font-bold'
      : preferences.theme === 'sepia'
      ? 'text-[#2c2217] font-bold'
      : 'text-[#1c1917] font-bold';

  const wordColorClass = 
    preferences.theme === 'dark'
      ? 'text-stone-300 hover:text-orange-400 border-b border-stone-300/20 hover:border-orange-400'
      : preferences.theme === 'sepia'
      ? 'text-[#2c2217] hover:text-amber-700 border-b border-[#2c2217]/20 hover:border-amber-700'
      : 'text-[#27211a] hover:text-sepia-accent border-b border-[#27211a]/20 hover:border-sepia-accent';

  const headerThemeClass = 
    preferences.theme === 'dark'
      ? 'bg-[#181614]/85 border-stone-800 text-stone-200'
      : preferences.theme === 'sepia'
      ? 'bg-[#f5f2ed]/85 border-sepia-300 text-[#2c2621]'
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
      : 'bg-[#dfd4be]';

  const pageBgClass = 
    preferences.theme === 'dark'
      ? 'bg-[#1c1917]'
      : 'bg-[#f5e9d3]';

  // src/components/ReadingView.tsx dosyası içindeki Header Alanı:

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
          </button>
        )}
        <BookOpen className="w-4 h-4 text-sepia-accent hidden sm:inline flex-shrink-0" />
        <span className={`font-serif font-extrabold text-sm sm:text-base md:text-lg lg:text-xl tracking-tight truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none ${titleThemeClass}`}>
          {book.title}
        </span>
        <span className="text-[10px] sm:text-xs text-stone-400 dark:text-stone-500 font-mono whitespace-nowrap flex-shrink-0">
          / s. {pageNumber}
        </span>
      </div>

      {/* Masaüstü Ortalanmış Otomatik Akış Kumandası */}
      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 md:gap-2 z-20">
        <button
          onClick={() => setIsAutoScrolling(!isAutoScrolling)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer ${
            isAutoScrolling
              ? 'bg-sepia-accent text-stone-950 border-sepia-accent'
              : 'border border-sepia-300 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white/40 dark:bg-stone-900/40 hover:bg-sepia-200/50'
          }`}
          title={isAutoScrolling ? "Otomatik akışı durdur" : "Otomatik akışı başlat"}
        >
          {isAutoScrolling ? (
            <>
              <Pause className="w-3.5 h-3.5 text-stone-950" />
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
            {([1, 1.25, 1.5, 2] as const).map((speed) => (
              <button
                key={speed}
                onClick={() => setScrollSpeed(speed)}
                className={`px-2.5 py-0.5 text-[8px] font-sans font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  scrollSpeed === speed
                    ? 'bg-sepia-accent text-stone-950 shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                {speed === 1 ? (
                  <span className="inline-flex items-center gap-1">
                    <span className="sm:hidden">0.25x</span>
                    <span className="hidden sm:inline">0.25x (Ergonomik yavaş okuma)</span>
                  </span>
                ) : speed === 1.25 ? '1.25x' : speed === 1.5 ? '1.5x' : '2x'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sağ Panel: Yer İmi ve Mobil Otomatik Akış Kumandası */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {/* Mobil Akış Kumandası (Sadece mobilde görünür, asla üst üste binmez) */}
        <div className="md:hidden flex items-center gap-1.5">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`flex items-center justify-center p-1.5 rounded-full border transition-all cursor-pointer ${
              isAutoScrolling
                ? 'bg-sepia-accent text-stone-950 border border-sepia-accent'
                : 'border-sepia-300 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white/45 dark:bg-stone-900/45 hover:bg-sepia-200/30'
            }`}
            title={isAutoScrolling ? "Otomatik akışı durdur" : "Otomatik akışı başlat"}
          >
            {isAutoScrolling ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {isAutoScrolling && (
            <button
              onClick={() => {
                if (scrollSpeed === 1) setScrollSpeed(1.25);
                else if (scrollSpeed === 1.25) setScrollSpeed(1.5);
                else if (scrollSpeed === 1.5) setScrollSpeed(2);
                else setScrollSpeed(1);
              }}
              className="px-2 py-1 text-[9px] font-sans font-bold rounded-full border border-sepia-300 dark:border-stone-850 bg-white/70 dark:bg-stone-900/70 text-stone-700 dark:text-stone-300 cursor-pointer transition-all hover:bg-sepia-200/50"
              title="Akış hızını değiştir"
            >
              {scrollSpeed === 1 ? '0.25x' : scrollSpeed === 1.25 ? '1.25x' : scrollSpeed === 1.5 ? '1.5x' : '2x'}
            </button>
          )}
        </div>

        {/* Yer İmi Butonu */}
        <button
          onClick={() => onToggleBookmark(book.id, pageNumber)}
          className={`p-2 rounded-full border transition-all cursor-pointer ${
            bookmarks.some((b) => b.bookId === book.id && b.page === pageNumber)
              ? 'border-sepia-accent bg-sepia-accent/10 text-sepia-accent'
              : 'border-sepia-300 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white/45 dark:bg-stone-900/45 hover:bg-sepia-200/50 dark:hover:bg-stone-800/50'
          }`}
          title={bookmarks.some((b) => b.bookId === book.id && b.page === pageNumber) ? "Yer imini kaldır" : "Kaldığım yeri işaretle"}
        >
          {bookmarks.some((b) => b.bookId === book.id && b.page === pageNumber) ? (
            <BookmarkCheck className="w-3.5 h-3.5" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
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
          <div className={`w-full max-w-[820px] mx-auto ${pageBgClass} rounded-xs shadow-[0_4px_30px_rgba(0,0,0,0.12)] md:shadow-[0_12px_60px_rgba(0,0,0,0.18)] flex flex-col gap-16 relative pb-24 pt-12 md:pt-16 px-6 sm:px-12 md:px-20 min-h-full`}>
            {loadedPages.map(({ pageNum, data }) => {
              const isActive = pageNum === pageNumber;
              const isFocused = focusActive && focusPageNum === pageNum;

              return (
                <div
                  key={pageNum}
                  id={`page-block-${pageNum}`}
                  data-page-num={pageNum}
                  className="relative pb-16 last:pb-0 rounded-lg p-2 md:p-4"
                >
                  {/* Sayfa Üst Süsü (Tüm Sayfalar İçin) */}
                  <div className={`flex items-center justify-center gap-3 mb-12 select-none transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-35 dark:opacity-55'}`}>
                    <div className={`h-[1px] transition-all duration-700 bg-sepia-accent/50 ${isActive ? 'w-24 bg-sepia-accent/80' : 'w-14'}`} />
                    <div className={`text-[10px] font-sans font-extrabold uppercase tracking-[0.25em] transition-all duration-700 ${isActive ? 'text-sepia-accent' : 'text-sepia-accent/80'}`}>
                      {book.title} — s. {pageNum}
                    </div>
                    <div className={`h-[1px] transition-all duration-700 bg-sepia-accent/50 ${isActive ? 'w-24 bg-sepia-accent/80' : 'w-14'}`} />
                  </div>

                  {/* Sayfa Metni */}
                  <ReadingPageContent
                    text={data.text}
                    preferences={preferences}
                    selectedWord={selectedWord}
                    searchQuery={searchQuery}
                    dictionary={dictionary}
                    wordColorClass={wordColorClass}
                    headingColorClass={preferences.theme === 'dark' ? 'text-stone-100' : preferences.theme === 'sepia' ? 'text-[#2c2217]' : 'text-[#27211a]'}
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

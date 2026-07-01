import React from 'react';
import { UserPreferences, DictionaryTerm } from '../types';

interface ReadingPageContentProps {
  text: string;
  preferences: UserPreferences;
  selectedWord: string | null;
  searchQuery: string;
  dictionary: Record<string, DictionaryTerm>;
  wordColorClass: string;
  headingColorClass: string;
  onWordClick: (e: React.MouseEvent<HTMLSpanElement>, term: DictionaryTerm) => void;
  onArabicClick: (e: React.MouseEvent<HTMLDivElement>, verseIdStr: string, arabicText: string) => void;
  fontSizeClass: string;
  lineHeightClass: string;
  fontStyleClass: string;
  textThemeClass: string;
}

// 1. Dinamik ve Değişen Yumuşak HSL Renk Tonu Oluşturucu (Noktalama segmentleri için)
const getDynamicSmoothColor = (text: string, index: number): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash + index);
  
  // Geniş ve son derece yumuşak bir HSL renk skalası (Hue: 0-360)
  // Saturation (Doygunluk) %55-72 arası (pastel)
  // Lightness (Açıklık) %83-89 arası (kağıt renginde harika uyum)
  const hue = hash % 360;
  const saturation = 55 + (hash % 17);
  const lightness = 83 + (hash % 7);
  
  return `hsla(${hue}, ${saturation}%, ${lightness}%, 0.42)`;
};

// 2. Alt başlıkları algılama mantığı (ihtar, birinci sır, mukaddime, nükte vb.)
const isLineSubheading = (text: string): boolean => {
  const t = text.trim();
  if (t.length === 0 || t.length > 55) return false;
  
  const lower = t.toLowerCase();
  
  if (
    lower.includes('ihtar') ||
    lower.includes('sır') ||
    lower.includes('nükte') ||
    lower.includes('maksad') ||
    lower.includes('mukaddime') ||
    lower.includes('tenbih') ||
    lower.startsWith('birinci') ||
    lower.startsWith('ikinci') ||
    lower.startsWith('üçüncü') ||
    lower.startsWith('dördüncü') ||
    lower.startsWith('beşinci') ||
    lower.startsWith('altıncı') ||
    lower.startsWith('yedinci') ||
    lower.startsWith('sekizinci') ||
    lower.startsWith('dokuzuncu') ||
    lower.startsWith('onuncu')
  ) {
    const words = t.split(/\s+/);
    if (words.length <= 4 || t.endsWith(':')) {
      return true;
    }
  }
  
  const lettersOnly = t.replace(/[^a-zA-ZçğışöüÇĞİŞÖÜ\s]/g, '');
  if (lettersOnly.length > 3 && lettersOnly === lettersOnly.toUpperCase()) {
    const words = t.split(/\s+/);
    if (words.length <= 4) {
      return true;
    }
  }
  
  return false;
};

// 3. Sual, Cevap, Elcevap vb. başlık kelimelerinin kontrolü
const isBoldHeader = (cleanWord: string): boolean => {
  const w = cleanWord.toLowerCase().trim();
  return (
    w === 'sual:' ||
    w === 'sual' ||
    w === 'cevab:' ||
    w === 'cevab' ||
    w === 'cevap:' ||
    w === 'cevap' ||
    w === 'elcevap:' ||
    w === 'elcevap' ||
    w === 'el-cevap:' ||
    w === 'el-cevap' ||
    w === 's->' ||
    w === 'c->' ||
    w.startsWith('sual:') ||
    w.startsWith('cevab:') ||
    w.startsWith('cevap:') ||
    w.startsWith('elcevap:') ||
    w.startsWith('el-cevap:')
  );
};

// 4. Metinlerdeki stray \ ve > işaretlerini temizleyen ve spacing düzenleyen önişlemci
const preprocessLine = (rawLine: string): string => {
  if (!rawLine) return '';
  let cleanLine = rawLine.replace(/\\+/g, ' ');
  cleanLine = cleanLine.replace(/>(?=\S)/g, '> ');
  return cleanLine;
};

// 5. Noktalama işaretlerine göre metni dilimlere ayıran fonksiyon
const segmentTextByPunctuation = (text: string): string[] => {
  const result: string[] = [];
  let currentSegment = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    currentSegment += char;
    if ([',', '.', ';', ':', '?', '!'].includes(char)) {
      const nextChar = text[i + 1];
      if (nextChar && [',', '.', ';', ':', '?', '!'].includes(nextChar)) {
        continue;
      }
      result.push(currentSegment);
      currentSegment = '';
    }
  }
  
  if (currentSegment) {
    result.push(currentSegment);
  }
  
  return result;
};

const cleanDisplayToken = (token: string): string => {
  let cleaned = token;
  cleaned = cleaned.replace(/\\+/g, '');
  cleaned = cleaned.replace(/>+$/, '');
  cleaned = cleaned.replace(/>+/g, '');
  return cleaned;
};

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

const getSearchHighlightClass = (theme: 'light' | 'dark' | 'sepia') => {
  if (theme === 'dark') {
    return 'bg-amber-500/35 text-amber-100 border-b-2 border-amber-500 font-extrabold px-0.5 rounded-sm shadow-xs';
  } else if (theme === 'sepia') {
    return 'bg-[#f4cf8a] text-[#422402] border-b-2 border-[#bc872e] font-extrabold px-0.5 rounded-sm shadow-xs';
  } else {
    return 'bg-amber-200 text-stone-950 border-b-2 border-amber-500 font-extrabold px-0.5 rounded-sm shadow-xs';
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
      <mark key={idx} className={`${highlightClass} search-highlight`}>
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

export const ReadingPageContent: React.FC<ReadingPageContentProps> = React.memo(({
  text,
  preferences,
  selectedWord,
  searchQuery,
  dictionary,
  wordColorClass,
  headingColorClass,
  onWordClick,
  onArabicClick,
  fontSizeClass,
  lineHeightClass,
  fontStyleClass,
  textThemeClass,
}) => {
  if (!text) return null;

  const lines = text.split('\n');
  let standardParagraphCount = 0;

  const renderTokensList = (tokensArray: string[], startIdx: number) => {
    return tokensArray.map((token, tokenIdx) => {
      const uniqueIdx = startIdx + tokenIdx;
      
      if (/^\s+$/.test(token)) {
        return <React.Fragment key={uniqueIdx}>{token}</React.Fragment>;
      }

      const cleanKey = token
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, '')
        .replace(/^\\"?/, '')
        .replace(/"?>$/, '')
        .replace(/>$/, '')
        .trim();

      const isLookupable = !!dictionary[cleanKey];
      const isActive = selectedWord?.toLowerCase() === cleanKey;
      const displayValue = cleanDisplayToken(token);

      const hasSearchMatch = searchQuery && getHighlightRanges(displayValue, searchQuery).length > 0;
      const highlightClass = getSearchHighlightClass(preferences.theme);

      let renderedToken = null;

      if (isLookupable) {
        renderedToken = (
          <span
            onClick={(e) => onWordClick(e, dictionary[cleanKey])}
            className={`interactive-word transition-all duration-200 border-b border-dashed border-sepia-accent/40 hover:border-sepia-accent cursor-pointer ${
              isActive
                ? 'bg-sepia-accent/30 text-sepia-accent font-bold px-0.5 rounded border-b border-sepia-accent'
                : wordColorClass
            }`}
            title={`${displayValue} - Lügatte bakmak için tıkla`}
          >
            {hasSearchMatch 
              ? renderTextWithHighlight(displayValue, searchQuery, highlightClass)
              : displayValue}
          </span>
        );
      } else if (hasSearchMatch) {
        renderedToken = (
          <span className={wordColorClass}>
            {renderTextWithHighlight(displayValue, searchQuery, highlightClass)}
          </span>
        );
      } else {
        renderedToken = <React.Fragment>{displayValue}</React.Fragment>;
      }

      const isBold = isBoldHeader(displayValue) || isBoldHeader(cleanKey);
      if (isBold) {
        renderedToken = (
          <strong className="font-extrabold text-[#881c1c] font-serif tracking-normal text-[17px] sm:text-[18px] md:text-[19px]">
            {renderedToken}
          </strong>
        );
      }

      return <React.Fragment key={uniqueIdx}>{renderedToken}</React.Fragment>;
    });
  };

  return (
    <div className={`${fontSizeClass} ${lineHeightClass} ${fontStyleClass} ${textThemeClass} tracking-wide`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // 1. Render section headers (e.g., &Birinci Söz>)
        if (trimmed.startsWith('&') && trimmed.endsWith('>')) {
          const headerText = trimmed.substring(1, trimmed.length - 1).trim();
          
          const titleColorClass = 
            preferences.theme === 'dark'
              ? 'text-stone-100'
              : preferences.theme === 'sepia'
              ? 'text-[#2c2217]'
              : 'text-[#1c1917]';

          return (
            <h1 
              key={idx} 
              style={{ fontFamily: 'FontRLN, serif' }}
              className={`text-center font-rln text-4xl sm:text-5xl md:text-6xl font-normal tracking-wide my-12 ${titleColorClass} max-w-2xl mx-auto px-4`}
            >
              {headerText}
            </h1>
          );
        }

        // 2. Empty lines
        if (!trimmed) {
          return <div key={idx} className="h-4" />;
        }

        // 3. Arabic lines (starting with ~)
        if (trimmed.startsWith('~')) {
          let arabicText = trimmed.substring(1).trim();
          
          let verseNumber: string | null = null;
          const verseMatch = arabicText.match(/\|(\d+)@$/);
          if (verseMatch) {
            verseNumber = verseMatch[1];
            arabicText = arabicText.replace(/\|(\d+)@$/, '').trim();
          }

          const isClickable = !!verseNumber;

          return (
            <div
              key={idx}
              dir="rtl"
              onClick={isClickable ? (e) => onArabicClick(e, verseNumber!, arabicText) : undefined}
              className={`text-center font-arabic text-3xl md:text-4xl my-8 text-[#ff0000] leading-loose tracking-normal flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                isClickable ? 'cursor-pointer' : ''
              }`}
              title={isClickable ? "Ayet / Hadis Meali İçin Tıklayın" : undefined}
            >
              <span className="font-normal block leading-loose font-arabic select-all">{arabicText}</span>
            </div>
          );
        }

        // 4. Caption / Centered Italicized Notes
        if (trimmed.startsWith(',') && trimmed.endsWith('>')) {
          const captionText = trimmed.substring(1, trimmed.length - 1).trim();
          const preprocessedCaption = preprocessLine(captionText);
          
          if (preferences.showTefekkurHighlights) {
            const segments = segmentTextByPunctuation(preprocessedCaption);
            return (
              <div
                key={idx}
                className="text-center italic text-stone-700 my-4 text-xs sm:text-sm font-serif leading-relaxed px-6 py-2.5 max-w-lg mx-auto transition-all duration-300"
              >
                {segments.map((segment, segIdx) => (
                  <span
                    key={segIdx}
                    style={{ backgroundColor: getDynamicSmoothColor(segment, segIdx) }}
                    className="rounded px-0.5 py-[2px] mx-[1px]"
                  >
                    {segment}
                  </span>
                ))}
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="text-center italic text-stone-600 my-4 text-xs sm:text-sm font-serif leading-relaxed px-6 py-2.5 max-w-lg mx-auto transition-all duration-300"
            >
              {preprocessedCaption}
            </div>
          );
        }

        // 4.5. Centered Subtitles
        if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
          const subtitleText = trimmed.substring(1, trimmed.length - 1).trim();
          const preprocessedSubtitle = preprocessLine(subtitleText);
          
          if (subtitleText.toLowerCase() === 'müellifi' || subtitleText === 'Müellifi') {
            return (
              <div
                key={idx}
                className="text-center font-sans font-extrabold text-xs sm:text-sm tracking-[0.25em] uppercase my-4 text-stone-500 dark:text-stone-400 max-w-2xl mx-auto px-4"
              >
                {preprocessedSubtitle}
              </div>
            );
          }
          
          if (subtitleText.includes('Said Nursî') || subtitleText.includes('Said Nursi') || subtitleText.includes('Bedîüzzaman')) {
            return (
              <div
                key={idx}
                className={`text-center font-sans font-bold text-lg sm:text-xl tracking-wide my-4 ${headingColorClass} max-w-2xl mx-auto px-4`}
              >
                {preprocessedSubtitle}
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`text-center font-serif font-bold text-[18px] sm:text-[20px] my-6 ${headingColorClass} max-w-2xl mx-auto px-4 leading-normal`}
            >
              {preprocessedSubtitle}
            </div>
          );
        }

        // 5. Notice / Ihtar blocks
        if (trimmed.startsWith('`') && trimmed.endsWith('>')) {
          const ihtarText = trimmed.substring(1, trimmed.length - 1).trim();
          const preprocessedIhtar = preprocessLine(ihtarText);
          return (
            <h3
              key={idx}
              className={`font-serif font-bold ${headingColorClass} mt-8 mb-4 text-[20px] tracking-tight text-left leading-snug`}
            >
              {preprocessedIhtar}
            </h3>
          );
        }

        // 6. Normal text lines
        const preprocessedLine = preprocessLine(line);

        if (isLineSubheading(trimmed)) {
          return (
            <h3
              key={idx}
              className={`font-serif font-bold ${headingColorClass} mt-8 mb-4 text-[20px] tracking-tight text-left leading-snug`}
            >
              {preprocessedLine}
            </h3>
          );
        }

        standardParagraphCount++;
        const isFirstPara = standardParagraphCount === 1; // Section basinda olup olmadigi sub-component seviyesinde basit tutuldu

        if (preferences.showTefekkurHighlights) {
          const segments = segmentTextByPunctuation(preprocessedLine);
          let tokenCounter = 0;

          return (
            <p
              key={idx}
              className={`mb-5 text-justify tracking-wide ${fontSizeClass} ${lineHeightClass} ${
                isFirstPara
                  ? 'font-serif'
                  : 'indent-10 sm:indent-12'
              }`}
            >
              {segments.map((segment, segIdx) => {
                const segmentBgColor = getDynamicSmoothColor(segment, segIdx);
                const segmentTokens = segment.split(/(\s+)/);
                const currentStart = tokenCounter;
                tokenCounter += segmentTokens.length;

                return (
                  <span
                    key={segIdx}
                    style={{ backgroundColor: segmentBgColor }}
                    className="rounded px-0.5 py-[2px] mx-[1px] transition-colors duration-300 inline"
                    title="Tefekkür Cümle Analizi"
                  >
                    {renderTokensList(segmentTokens, currentStart)}
                  </span>
                );
              })}
            </p>
          );
        } else {
          const tokens = preprocessedLine.split(/(\s+)/);
          return (
            <p
              key={idx}
              className={`mb-5 text-justify tracking-wide ${fontSizeClass} ${lineHeightClass} ${
                isFirstPara
                  ? 'font-serif'
                  : 'indent-10 sm:indent-12'
              }`}
            >
              {renderTokensList(tokens, 0)}
            </p>
          );
        }
      })}
    </div>
  );
});

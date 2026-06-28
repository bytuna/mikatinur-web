import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function parseHasiyeFile(hasiyeTxtPath: string): Record<number, { id: string; marker: string; text: string }[]> {
  const hasiyeler: Record<number, { id: string; marker: string; text: string }[]> = {};
  if (!fs.existsSync(hasiyeTxtPath)) return hasiyeler;
  
  try {
    const rawText = fs.readFileSync(hasiyeTxtPath, 'utf-8');
    const lines = rawText.split(/\r?\n/);
    let currentPageNum: number | null = null;
    let currentMarker: string | null = null;
    let currentTextLines: string[] = [];
    let idCounter = 1;
    
    const saveCurrentHasiye = () => {
      if (currentPageNum !== null && currentMarker !== null && currentTextLines.length > 0) {
        if (!hasiyeler[currentPageNum]) hasiyeler[currentPageNum] = [];
        hasiyeler[currentPageNum].push({
          id: `fn-hasiye-${idCounter++}-${Math.random().toString(36).substr(2, 4)}`,
          marker: currentMarker,
          text: currentTextLines.join(' ').trim()
        });
        currentMarker = null;
        currentTextLines = [];
      }
    };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      const pipeMatch = trimmedLine.match(/^(\d+)\|([^|]+)\|(.*)/);
      if (pipeMatch) {
        saveCurrentHasiye();
        const pNum = parseInt(pipeMatch[1], 10);
        const marker = pipeMatch[2].trim();
        const text = pipeMatch[3].trim();
        if (!hasiyeler[pNum]) hasiyeler[pNum] = [];
        hasiyeler[pNum].push({
          id: `fn-hasiye-${idCounter++}-${Math.random().toString(36).substr(2, 4)}`,
          marker: marker,
          text: text
        });
        continue;
      }
      
      const pageMatch = trimmedLine.match(/^(?:#\s*(\d+)|[sS]\.?\s*(\d+)|[sS]ayfa\s*(\d+))/i);
      if (pageMatch) {
        saveCurrentHasiye();
        currentPageNum = parseInt(pageMatch[1] || pageMatch[2] || pageMatch[3], 10);
        continue;
      }
      
      if (currentPageNum !== null) {
        const markerMatch = trimmedLine.match(/^(\[\d+\]|\(\*\)|\(\d+\)|\*)\s*(.*)/);
        if (markerMatch) {
          saveCurrentHasiye();
          currentMarker = markerMatch[1];
          currentTextLines = [markerMatch[2].trim()];
        } else {
          if (currentMarker !== null) {
            currentTextLines.push(trimmedLine);
          } else {
            currentMarker = '(*)';
            currentTextLines = [trimmedLine];
          }
        }
      }
    }
    saveCurrentHasiye();
  } catch (error) {
    console.error(error);
  }
  return hasiyeler;
}

function parseTextToBookJson(txtPath: string, jsonPath: string, bookId: string): number {
  try {
    const rawText = fs.readFileSync(txtPath, 'utf-8');
    const lines = rawText.split(/\r?\n/);
    const pages: Record<string, any> = {};
    const sections: any[] = [];
    let currentPageNum: number | null = null;
    let currentPageLines: string[] = [];
    
    let hasiyePath = '';
    const possibleHasiyePaths = [
      path.join(process.cwd(), 'public', 'hasiye', `${bookId}h.txt`),
      path.join(process.cwd(), 'public', 'hasiye', `${bookId}.txt`),
    ];
    for (const p of possibleHasiyePaths) {
      if (fs.existsSync(p)) {
        hasiyePath = p;
        break;
      }
    }
    const externalHasiyeler = hasiyePath ? parseHasiyeFile(hasiyePath) : {};
    
    const extractFootnotes = (text: string) => {
      const footnotes: any[] = [];
      const lines = text.split('\n');
      let idCounter = 1;
      for (const line of lines) {
        const trimmed = line.trim();
        const match = trimmed.match(/^(\[\d+\]|\(\*\))\s*(.*)/);
        if (match) {
          footnotes.push({
            id: `fn-${idCounter++}-${Math.random().toString(36).substr(2, 4)}`,
            marker: match[1],
            text: match[2].trim()
          });
        }
      }
      return footnotes;
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      const match = trimmedLine.match(/^#\s*(\d+)/);
      if (match) {
        if (currentPageNum !== null) {
          const pageText = currentPageLines.join('\n').trim();
          let pageFootnotes = extractFootnotes(pageText);
          if (externalHasiyeler[currentPageNum]) {
            pageFootnotes = [...pageFootnotes, ...externalHasiyeler[currentPageNum]];
          }
          pages[currentPageNum.toString()] = {
            pageNumber: currentPageNum,
            text: pageText,
            footnotes: pageFootnotes,
            terms: []
          };
        }
        currentPageNum = parseInt(match[1], 10);
        currentPageLines = [];
      } else {
        const sectionMatch = trimmedLine.match(/^&\s*([^>]+)>/);
        if (sectionMatch && currentPageNum !== null) {
          const title = sectionMatch[1].trim();
          const isBookTitle = title.toUpperCase() === title && title.length < 30;
          if (!isBookTitle || sections.length > 0) {
            sections.push({
              id: title.toLowerCase().replace(/[^a-z0-9ğüşöçı]+/g, '-'),
              title: title,
              startPage: currentPageNum
            });
          }
        }
        if (currentPageNum !== null) currentPageLines.push(line);
      }
    }
    
    if (currentPageNum !== null) {
      const pageText = currentPageLines.join('\n').trim();
      let pageFootnotes = extractFootnotes(pageText);
      if (externalHasiyeler[currentPageNum]) {
        pageFootnotes = [...pageFootnotes, ...externalHasiyeler[currentPageNum]];
      }
      pages[currentPageNum.toString()] = {
        pageNumber: currentPageNum,
        text: pageText,
        footnotes: pageFootnotes,
        terms: []
      };
    }
    
    const pageNumbers = Object.keys(pages).map(Number);
    const startingPage = pageNumbers.length > 0 ? Math.min(...pageNumbers) : 1;
    const maxPage = pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
    const totalPages = pageNumbers.length > 0 ? (maxPage - startingPage + 1) : 0;

    const output = { bookId, startingPage, totalPages, sections, pages };
    fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf-8');
    return pageNumbers.length;
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function GET() {
  const booksDir = path.join(process.cwd(), 'public', 'books');
  const results = { parsed: [] as string[], errors: [] as string[] };
  
  try {
    if (!fs.existsSync(booksDir)) {
      fs.mkdirSync(booksDir, { recursive: true });
    }
    const files = fs.readdirSync(booksDir);
    const txtFiles = files.filter(f => f.endsWith('.txt'));
    
    for (const file of txtFiles) {
      const bookId = file.replace('.txt', '');
      const txtPath = path.join(booksDir, file);
      const jsonPath = path.join(booksDir, `${bookId}.json`);
      const pageCount = parseTextToBookJson(txtPath, jsonPath, bookId);
      if (pageCount > 0) {
        results.parsed.push(`${file} (${pageCount} sayfa)`);
      } else {
        results.errors.push(`${file} (Dönüştürülemedi)`);
      }
    }
    return NextResponse.json({ success: true, ...results });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
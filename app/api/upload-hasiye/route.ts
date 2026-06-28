import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { bookId, content } = await req.json();
    if (!bookId || !content) {
      return NextResponse.json({ error: 'Kitap kimliği ve içerik gereklidir.' }, { status: 400 });
    }

    const cleanBookId = bookId.replace(/[^a-zA-Z0-9_-]/g, '');
    const hasiyeDir = path.join(process.cwd(), 'public', 'hasiye');
    const targetPath = path.join(hasiyeDir, `${cleanBookId}h.txt`);

    if (!fs.existsSync(hasiyeDir)) {
      fs.mkdirSync(hasiyeDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, content, 'utf-8');

    // Senkronizasyonu tetikle (aynı zamanda kitap derlemesini günceller)
    return NextResponse.json({
      success: true,
      message: `Haşiye dosyası kaydedildi. Değişikliklerin yansıması için kitap dönüştürme tetiklenebilir.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
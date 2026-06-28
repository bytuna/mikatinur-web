// app/api/explain/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Gemini istemcisini lazy (istek anında) ilklendiriyoruz
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const { word, definition, context } = await request.json();

    if (!word) {
      return NextResponse.json({ error: 'Kelime parametresi gereklidir.' }, { status: 400 });
    }

    if (!ai) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı (GEMINI_API_KEY) çevre değişkenlerinde tanımlı değil.' },
        { status: 500 }
      );
    }

    const prompt = `Sen "MikatiNur" Risale-i Nur Okuma Platformu'nun tefekkür asistanısın.
Kullanıcı okuma yaparken şu kelimeyi tıkladı ve derinlemesine tefekkür etmek istiyor:

Kelime: "${word}"
Sözlük Anlamı: "${definition || ''}"
Okunan Sayfadaki Bağlam (Context):
"""
${context || ''}
"""

Görevin:
Bu kelimenin öncelikle etimolojik/lügat anlamını kısaca doğrula. Ardından, Risale-i Nur terminolojisinde (Said Nursi'nin eserlerindeki imanî, tefekkürî ve tasavvufî bağlamı) bu kelimenin/kavramın nasıl bir öneme sahip olduğunu, insanın acz ve fakr boyutuyla nasıl ilişkilendirildiğini anlatan, akıcı, edebi ve ruhu dinlendirici 2-3 paragraflık bir tefekkür açıklaması yaz. 
Türkçe yaz, üslubun saygılı, mültefit, manevi açıdan derinleştirici ve estetik olsun. Başlık veya ekstra etiket ekleme, doğrudan paragrafları yaz.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const explanation = response.text || 'Yapay zeka açıklaması üretilemedi.';
    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error('Gemini API Hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Gemini API ile iletişim kurulurken hata oluştu.' },
      { status: 500 }
    );
  }
}
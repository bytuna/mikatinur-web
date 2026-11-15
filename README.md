<div align="center">

<img src="public/mikat-nur-icon.png" alt="Mîkāt-ı Nur Logo" width="96" height="96" />

# Mîkāt-ı Nur Web Platformu

**"Dijital dünyaya taşınan manevi miras"**

Türkiye'nin **81 ili ve 973 ilçesi** ile dünya genelinde yüksek hassasiyetli **Namaz Vakitleri & Kıble Pusulası**, **Dini Günler & Resmi Ramazan İmsakiyesi**, **15 Ciltlik Risale-i Nur Külliyatı Dijital Okuma & Tefekkür Platformu** ve **Mîkāt-ı Nur Android Uygulaması** ekosistemini tek çatı altında buluşturan modern web platformu.

[![Canlı Site](https://img.shields.io/badge/Canl%C4%B1_Platform-mikatinur.com.tr-d97706?style=for-the-badge&logo=vercel&logoColor=white)](https://www.mikatinur.com.tr)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.9-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Android APK](https://img.shields.io/badge/Android_Uygulamas%C4%B1-v1.1.7-10B981?style=for-the-badge&logo=android&logoColor=white)](https://www.mikatinur.com.tr/download/)

[🌐 Canlı Web Sitesi](https://www.mikatinur.com.tr) • [📖 Risale-i Nur Külliyatı](https://www.mikatinur.com.tr/projects/risaleinur/) • [🕌 Dini Günler & İmsakiye](https://www.mikatinur.com.tr/projects/dini-gunler/) • [📱 Android APK İndir](https://www.mikatinur.com.tr/download/) • [💬 İletişim & Geri Bildirim](https://www.mikatinur.com.tr/contact/)

</div>

---

## ✨ Platform Modülleri ve Öne Çıkan Özellikler

| Modül | Rota | Açıklama |
| :--- | :--- | :--- |
| 🕌 **Namaz Vakitleri & Kıble** | [`/`](https://www.mikatinur.com.tr/) | Türkiye'nin **81 ili ve 973 ilçesi** ile dünya şehirleri için canlı geri sayım sayacı, GPS ile en yakın ilçe tespiti, Büyük Daire Kıble açısı, Hicri takvim ve aylık imsakiye tablosu. |
| 🌙 **Dini Günler & Ramazan İmsakiyesi** | [`/projects/dini-gunler/`](https://www.mikatinur.com.tr/projects/dini-gunler/) | Diyanet İşleri Başkanlığı resmi Dini Günler ve Geceler takvimi, yaklaşan mübarek gün/gece için canlı geri sayım kartı ve il/ilçe bazlı **Resmi Ramazan İmsakiyesi**. |
| 📚 **Risale-i Nur Külliyatı Okuyucu** | [`/projects/risaleinur/`](https://www.mikatinur.com.tr/projects/risaleinur/) | **15 ciltlik tam külliyat**, tahrifatsız metin, tıklanabilir Osmanlıca-Türkçe lügat, Kur'an-ı Kerim meali eşleştirme, haşiye/dipnot ayrıştırıcı, 6 okuma teması ve Gemini AI destekli tefekkür asistanı. |
| 📱 **Mîkāt-ı Nur Android Vitrin & İndirme** | [`/projects/mikatinur/`](https://www.mikatinur.com.tr/projects/mikatinur/) & [`/download/`](https://www.mikatinur.com.tr/download/) | Mîkāt-ı Nur Android uygulamasının (`v1.1.7`) mimari tanıtımı, sürüm notları ve doğrudan APK dağıtım merkezi. |
| ✉️ **İletişim, Forum & Hata Bildirimi** | [`/contact/`](https://www.mikatinur.com.tr/contact/) & [`/forum/`](https://www.mikatinur.com.tr/forum/) | KVKK uyumlu iletişim formu ve okuma ekranı üzerinden **ekran görüntüsü üzerinde çizim yaparak** doğrudan tashih/hata bildirme sistemi. |

---

## 🧭 1. Namaz Vakitleri, Kıble ve Hibrit Astronomi Motoru (`lib/prayer/`)

Mîkāt-ı Nur, hem web arayüzüne hem de Mîkāt-ı Nur Android uygulamasına kesintisiz veri sağlayan çift katmanlı (hibrit) bir namaz vakti mimarisine sahiptir:

- **Tam Kapsamlı Türkiye Veri Seti:** Türkiye'nin **81 ili ve 973 resmi ilçesinin tamamı** coğrafi koordinatları (`lat`/`lon`), zaman dilimleri ve Diyanet İşleri Başkanlığı ilçe kodlarıyla tanımlıdır.
- **Hibrit Hesaplama Garantisi (`service.ts` & `engine.ts`):**
  1. **Birincil Kaynak:** Diyanet İşleri Başkanlığı resmi vakit pencereleri (`12 saat` bellek içi TTL önbellekleme ile).
  2. **Kesintisiz Astronomik Yedek Motor:** Herhangi bir ağ kesintisinde veya yurt dışı koordinatlarında harici kütüphane gerektirmeyen saf TypeScript **NOAA Güneş Konumu (Deklinasyon & Zaman Denklemi)** motoru devreye girer; Diyanet (`18° / 17°` + resmi temkin süreleri) ve **Ümmü'l-Kurâ** (Mekke/Medine) standartlarında dakikası dakikasına hesaplama yapar.
- **Kıble Pusulası & Hicri Takvim:** Küresel trigonometri (Great-Circle Bearing) ile Kâbe-i Muazzama açısı (`qiblaBearing`) ve astronomik Hicri-Miladi tarih dönüşümü (`hijriDateTr`).

---

## 📖 2. Risale-i Nur Külliyatı Dijital Okuma ve Tefekkür Platformu

Okuma ve araştırma deneyimini geleneksel kitap estetiğiyle birleştiren özel okuyucu motoru:

- **15 Ciltlik Tam Külliyat:** *Sözler, Mektubat, Lem'alar, Şualar, Tarihçe-i Hayat, İşârâtü'l-İ'câz, Mesnevî-i Nuriye, Sikke-i Tasdik-i Gaybî, Barla Lâhikası, Kastamonu Lâhikası, Emirdağ Lâhikası I-II, Âsâ-yı Mûsâ, Muhâkemat, Münâzarat* ve *İman ve Küfür Muvazeneleri*.
- **Tıklanabilir Osmanlıca-Türkçe Lügat:** Metin üzerindeki kelimelere tıklandığında bağlama uygun Osmanlıca-Türkçe lügat manası ve cümle içi tefekkür açıklaması açılır.
- **Diakritik Duyarsız Tam Külliyat Arama:** Şapkalı/uzatmalı harfleri (`â, î, û, ğ, '`) normalize ederek 15 cilt genelinde saniyeler içinde kelime ve ibare taraması yapar.
- **Kur'an-ı Kerim Meali & Haşiye Eşleştirme:** Metin içindeki ayet-i kerime ibarelerini (`public/meal/`) ve sayfa altı haşiyeleri (`public/hasiye/`) otomatik algılayarak etkileşimli pencerede sunar.
- **6 Özel Okuma Teması & 6 Arapça Hat Fontu (`TefekkurSettings.tsx`):**
  - *Temalar:* Gündüz (`light`), Tefekkür (`sepia`), Saman Kağıdı (`saman`), Göz Dostu (`green`), Kitap Kağıdı (`gray`) ve Gece (`dark`).
  - *Hat Fontları:* Hamdullah, Hasenat, Osman Taha (Uthman Taha), Amiri, Scheherazade ve Noto Naskh Arabic.
- **Çizimli Tashih / Hata Bildirimi (`BugReportModal.tsx`):** Okuyucu, sayfada gördüğü herhangi bir dizgi veya metin hatasını ekran görüntüsü üzerinde kalemle işaretleyerek doğrudan yönetici paneline iletebilir.

---

## 📜 Asıl Nüsha Künyesi ve İstiğna Düsturu (%100 Ücretsiz Hizmet)

> *"Evvelâ: Risale-i Nur benim mülküm değil; Kur'ân'ın malıdır, Kur'ân-ı Hakîm'in arşıyla bağlıdır. Kimin haddi var ki, ona ilişsin..."*
> — **Emirdağ Lâhikası I, s. 49**

> *"«İn ecrîye illâ alâllâh» (Benim ecrim ancak Allah'a aittir)."*
> — **Mektubat, İkinci Mektub, s. 13 (İstiğna Düsturu)**

- **Asıl Nüsha Kaynağı:** Platformumuzda yer alan Risale-i Nur Külliyatı metinleri, Bediüzzaman Said Nursî Hazretlerinin varisleri tarafından muhafaza edilen **Hizmet Vakfı / Envâr Neşriyat** baskıları (*Asıl Nüsha*) esas alınarak; metinlerin aslî imlâsına, sayfa düzenine ve haşiyelerine **%100 sadık kalınarak, hiçbir sadeleştirme veya tahrifat yapılmaksızın** dijital ortama aktarılmıştır.
- **Ticari Amaç Güdülmez:** Mîkāt-ı Nur Web Platformu ve Android uygulaması **tamamen ücretsiz ve reklamsız** bir iman ve Kur'an hizmeti projesidir; hiçbir şekilde abonelik, bağış, reklam veya ticari gelir talep edilmez.

---

## 🛠️ Teknoloji Yığını

| Katman | Teknolojiler |
| :--- | :--- |
| **Çekirdek Framework** | Next.js `16.2.9` (App Router), React `19.2.4`, TypeScript `5` |
| **Arayüz & Animasyon** | Tailwind CSS `v4`, Framer Motion `12.42`, Lucide React `1.21` |
| **Yapay Zeka (Tefekkür Asistanı)** | Google Gemini AI (`@google/genai` & `@google/generative-ai`) |
| **Veritabanı & Analitik** | Vercel Postgres (`@vercel/postgres`), Recharts `3.10`, Vercel Analytics & Speed Insights |
| **Yardımcı Araçlar** | `tz-lookup` (Zaman dilimi tespiti), `modern-screenshot` (Ekran görüntülü hata bildirimi) |

---

## 👤 Geliştirici ve İletişim

- **Geliştirici:** İlker Tuna (**ByTuna**)
- **Web Platformu:** [https://www.mikatinur.com.tr](https://www.mikatinur.com.tr)
- **İletişim & Geri Bildirim:** [https://www.mikatinur.com.tr/contact/](https://www.mikatinur.com.tr/contact/)
- **KVKK Aydınlatma Metni:** [https://www.mikatinur.com.tr/kvkk-aydinlatma-metni/](https://www.mikatinur.com.tr/kvkk-aydinlatma-metni/)

<div align="center">
  <sub>© 2026 <b>Mîkāt-ı Nur</b> — Dijital dünyaya taşınan manevi miras. Hiçbir ticari amaç güdülmeksizin ücretsiz ve reklamsız olarak sunulmaktadır.</sub>
</div>

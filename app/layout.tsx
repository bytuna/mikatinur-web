import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react'; // 1. Analitik paketini buraya import ettik

export const metadata: Metadata = {
  title: "Mikat-ı Nur | İlker TUNA - Android Geliştirici Portfolyosu",
  description: "İlker TUNA tarafından geliştirilen, Kotlin ve modern Android teknolojileri ile hazırlanan dijital kütüphane ve uygulama ekosistemi.",
  keywords: ["İlker TUNA", "Android Geliştirici", "Mikat-ı Nur", "Kotlin", "Risale-i Nur Dijital", "Android Studio Panda"],
  authors: [{ name: "İlker TUNA" }],
  openGraph: {
    title: "Mikat-ı Nur | İlker TUNA",
    description: "Android tabanlı dijital çözümler ve kütüphane projeleri.",
    url: "https://mikatinur.com.tr",
    siteName: "Mikat-ı Nur",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        {children}
        <Analytics /> {/* 2. Analitik bileşenini burada çağırdık, sihir burada gerçekleşiyor */}
      </body>
    </html>
  );
}
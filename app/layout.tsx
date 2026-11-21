import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLdSchema } from "../components/JsonLdSchema";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import { ThemeToggle } from "../components/ThemeToggle";
import { SiteFooter } from "../components/SiteFooter";

const siteUrl = "https://www.mikatinur.com.tr";
const siteName = "Mîkāt-ı Nur";
const defaultTitle = "Mîkāt-ı Nur | Namaz Vakitleri, Kıble Tayini ve Risale-i Nur Külliyatı";
const defaultDescription =
  "Mîkāt-ı Nur; Diyanet uyumlu namaz vakitleri, hassas Kıble pusulası, Hicrî takvim, dinî günler ve Osmanlıca-Türkçe lügatlı Risale-i Nur Külliyatı ile Evrad ve Hadis kütüphanesini ücretsiz sunan İslâmî dijital platformdur.";
const defaultKeywords = [
  "Mîkāt-ı Nur",
  "Mikatinur",
  "namaz vakitleri",
  "ezan vakitleri",
  "kıble pusulası",
  "risale-i nur külliyatı",
  "risale-i nur oku",
  "osmanlıca lügat",
  "hicri takvim",
  "dini günler",
  "cevşen",
  "kütüb-i sitte"
].join(", ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Mîkāt-ı Nur",
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  authors: [{ name: "Mîkāt-ı Nur", url: siteUrl }],
  creator: "Mîkāt-ı Nur",
  applicationName: siteName,
  generator: "Next.js",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/mikat-nur-icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: ["/mikat-nur-icon.png"],
    apple: [{ url: "/mikat-nur-icon.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Mîkāt-ı Nur - Namaz Vakitleri ve Risale-i Nur Külliyatı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-image.svg"],
    creator: "@mikatinur",
  },
  verification: {
    google: "google-site-verification=0GO2nsCrf6PEXfovzLnHG-1s504Ln1EWCU2A32Cno9Q",
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mîkāt-ı Nur',
  alternateName: 'Mikatinur',
  url: siteUrl,
  inLanguage: 'tr-TR',
  description: defaultDescription,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f8fafc" />
        <meta name="format-detection" content="telephone=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('mikatinur_site_theme')==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}`,
          }}
        />
      </head>
      <body className="antialiased bg-[#f8fafc] text-slate-900 dark:bg-[#050505] dark:text-gray-100">
        <JsonLdSchema data={websiteSchema} />
        <AnalyticsTracker />
        <ThemeToggle />
        {children}
        <SiteFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
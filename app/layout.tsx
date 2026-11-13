import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLdSchema } from "../components/JsonLdSchema";
import { AnalyticsTracker } from "../components/AnalyticsTracker";
import { ThemeToggle } from "../components/ThemeToggle";

const siteUrl = "https://www.mikatinur.com.tr";
const siteName = "Mikatinur";
const defaultTitle = "Mikatinur | Yazılım Geliştirici, Dijital Projeler ve Teknoloji";
const defaultDescription = "Mikatinur, yazılım geliştirme, dijital projeler, mobil ve web teknolojileri üzerine uzmanlaşmış kişisel teknoloji ekosistemidir.";
const defaultKeywords = [
  "Mikatinur",
  "yazılım geliştirici",
  "web geliştirme",
  "next.js",
  "react",
  "typescript",
  "mobil uygulama",
  "dijital proje",
  "teknoloji",
  "software developer",
  "full stack developer",
  "Mikatinur web sitesi"
].join(", ");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Mikatinur",
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  authors: [{ name: "Mikatinur", url: siteUrl }],
  creator: "Mikatinur",
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
        alt: "Mikatinur - Yazılım Geliştirici ve Dijital Projeler",
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

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Mikatinur',
  url: siteUrl,
  sameAs: [
    'https://github.com/mikatinur',
    'https://www.linkedin.com/in/mikatinur',
    'https://www.instagram.com/mikatinur',
  ],
  jobTitle: 'Yazılım Geliştirici',
  knowsAbout: [
    'Web Geliştirme',
    'Yazılım Mimarisi',
    'Next.js',
    'React',
    'TypeScript',
    'Mobil Uygulama Geliştirme',
    'Dijital Projeler'
  ],
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
        <JsonLdSchema data={personSchema} />
        <AnalyticsTracker />
        <ThemeToggle />
        {children}
        <footer className="border-t border-slate-200 dark:border-gray-900 bg-slate-100/80 dark:bg-[#050505] px-6 py-5 text-center text-xs text-slate-500 dark:text-gray-600 transition-colors">
          <Link href="/kvkk-aydinlatma-metni" className="transition-colors hover:text-slate-900 dark:hover:text-gray-300">
            KVKK Aydınlatma Metni
          </Link>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLdSchema } from "../components/JsonLdSchema";
import { AnalyticsTracker } from "../components/AnalyticsTracker";

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
    <html lang="tr">
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="antialiased">
        <JsonLdSchema data={personSchema} />
        <AnalyticsTracker />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
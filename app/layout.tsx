import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";
import StructuredData from "@/components/StructuredData";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/structuredData";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://autovarka.com.ua'),
  title: {
    default: "Автоварка - Автомобільні мультиварки 12-24V",
    template: "%s | Автоварка",
  },
  description: "Професійні мультиварки для автомобілів, вантажівок та автобусів. Якісна продукція з гарантією. Доставка по всій Україні.",
  keywords: ["мультиварка автомобільна", "мультиварка 12в", "мультиварка 24в", "мультиварка для фури", "мультиварка для вантажівки", "автоварка", "мультиварка в машину"],
  authors: [{ name: "Автоварка" }],
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
    title: "Автоварка - Автомобільні мультиварки 12-24V",
    description: "Професійні мультиварки для автомобілів, вантажівок та автобусів",
    type: "website",
    locale: "uk_UA",
    siteName: "Автоварка",
    url: "https://autovarka.com.ua",
    images: [
      {
        url: '/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Автоварка - Автомобільні мультиварки',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Автоварка - Автомобільні мультиварки 12-24V",
    description: "Професійні мультиварки для автомобілів, вантажівок та автобусів",
    images: ['/images/hero-banner.jpg'],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: 'google-site-verification-code', // Заменить на реальный код после регистрации в Google Search Console
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Структурированные данные для всего сайта
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html lang="uk">
      <body className={`${inter.variable} antialiased`}>
        <StructuredData data={[organizationSchema, websiteSchema]} />
        <Analytics />
        {children}
      </body>
    </html>
  );
}

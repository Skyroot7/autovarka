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
    default: "Автоварка – мультиварки 12/24/220В для дальнобійщика | від 999₴",
    template: "%s | Автоварка - Мультиварки для Дальнобійщиків",
  },
  description: "🚗 Автомобільні мультиварки 12В, 24 вольта, 220В для дальнобійщиків і вантажівок. ✅ Гарантія 6 місяців ⚡ Швидка доставка по Україні від 999₴. Купити мультиварку для фури зараз!",
  keywords: [
    "мультиварка 24 вольта", 
    "автомобильная мультиварка", 
    "мультиварка для дальнобойщика", 
    "мультиварка 12/24/220",
    "мультиварка автомобільна", 
    "мультиварка 12в", 
    "мультиварка 24в", 
    "мультиварка для фури", 
    "мультиварка для вантажівки", 
    "автоварка", 
    "мультиварка в машину",
    "мультиварка від прикурювача",
    "мультиварка для грузовика",
    "купити мультиварку автомобільну"
  ],
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
    title: "🚗 Автоварка - Мультиварки 12/24/220В для Дальнобійщиків від 999₴",
    description: "Автомобільні мультиварки 24 вольта для вантажівок і дальнобійщиків. Гарантія 6 місяців. Швидка доставка по Україні. Купити мультиварку для фури!",
    type: "website",
    locale: "uk_UA",
    siteName: "Автоварка - Мультиварки для Вантажівок",
    url: "https://autovarka.com.ua",
    images: [
      {
        url: '/images/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'Автомобільна мультиварка 12/24/220V для дальнобійщика - Автоварка',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🚗 Автоварка - Мультиварки 24 вольта для Дальнобійщиків від 999₴",
    description: "Автомобільні мультиварки для вантажівок. Гарантія 6 місяців. Доставка по Україні. Купити мультиварку 12/24/220 для дальнобійщика!",
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

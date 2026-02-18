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

type RootLayoutProps = {
  children: React.ReactNode;
  params: { locale?: string };
};

export default function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  // Структурированные данные для всего сайта
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();
  
  // Определяем язык из параметров или используем 'uk' по умолчанию
  const locale = params?.locale || 'uk';

  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased`}>
        <StructuredData data={[organizationSchema, websiteSchema]} />
        <Analytics />
        {children}
      </body>
    </html>
  );
}

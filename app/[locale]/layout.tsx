import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { Inter } from "next/font/google";
import "../globals.css";
import Analytics from "@/components/Analytics";
import StructuredData from "@/components/StructuredData";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/structuredData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { generateAlternates, getOgLocale } from "@/lib/seo";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  const siteNames: Record<string, string> = {
    uk: 'Автоварка - Мультиварки для Вантажівок',
    ru: 'Автоварка - Мультиварки для Грузовиков',
    en: 'Autovarka - Multicookers for Trucks',
    pl: 'Autovarka - Multicookery dla Ciężarówek',
    de: 'Autovarka - Multikocher für LKW',
  };

  const templates: Record<string, string> = {
    uk: 'Автоварка - Мультиварки для Далекобійників',
    ru: 'Автоварка - Мультиварки для Дальнобойщиков',
    en: 'Autovarka - Multicookers for Truckers',
    pl: 'Autovarka - Multicookery dla Kierowców TIR',
    de: 'Autovarka - Multikocher für LKW-Fahrer',
  };

  const ogAlts: Record<string, string> = {
    uk: 'Автомобільна мультиварка 12/24/220V для далекобійника - Автоварка',
    ru: 'Автомобильная мультиварка 12/24/220V для дальнобойщика - Автоварка',
    en: 'Car Multicooker 12/24/220V for Truckers - Autovarka',
    pl: 'Multicooker samochodowy 12/24/220V dla kierowcy TIR - Autovarka',
    de: 'Auto-Multikocher 12/24/220V für LKW-Fahrer - Autovarka',
  };

  return {
    metadataBase: new URL('https://autovarka.com.ua'),
    title: {
      default: t('title'),
      template: `%s | ${templates[locale] || templates.uk}`,
    },
    description: t('description'),
    keywords: t('keywords').split(', '),
    authors: [{ name: 'Автоварка' }],
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
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
    icons: {
      icon: '/favicon.ico',
    },
    verification: {
      google: 'google-site-verification-code',
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: getOgLocale(locale),
      siteName: siteNames[locale] || siteNames.uk,
      url: locale === 'uk' ? 'https://autovarka.com.ua' : `https://autovarka.com.ua/${locale}`,
      images: [
        {
          url: '/images/hero-banner.jpg',
          width: 1200,
          height: 630,
          alt: ogAlts[locale] || ogAlts.uk,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
      images: ['/images/hero-banner.jpg'],
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();
  
  return (
    <html lang={locale}>
      <body className={`${inter.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <StructuredData data={[organizationSchema, websiteSchema]} />
          <Analytics />
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

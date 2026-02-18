import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';
import LocaleProvider from '@/components/LocaleProvider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  const localeMap: Record<string, string> = {
    uk: 'uk_UA',
    ru: 'ru_RU',
    en: 'en_US',
    pl: 'pl_PL',
    de: 'de_DE',
  };

  return {
    metadataBase: new URL('https://autovarka.com.ua'),
    title: {
      default: t('title'),
      template: `%s | ${locale === 'uk' ? 'Автоварка - Мультиварки для Далекобійників' : locale === 'ru' ? 'Автоварка - Мультиварки для Дальнобойщиков' : locale === 'pl' ? 'Autovarka - Multicookery dla Kierowców TIR' : locale === 'de' ? 'Autovarka - Multikocher für LKW-Fahrer' : 'Autovarka - Multicookers for Truckers'}`,
    },
    description: t('description'),
    keywords: t('keywords').split(', '),
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
      google: 'google-site-verification-code',
    },
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      type: 'website',
      locale: localeMap[locale] || 'uk_UA',
      siteName: locale === 'uk' ? 'Автоварка - Мультиварки для Вантажівок' : locale === 'ru' ? 'Автоварка - Мультиварки для Грузовиков' : locale === 'pl' ? 'Autovarka - Multicookery dla Ciężarówek' : locale === 'de' ? 'Autovarka - Multikocher für LKW' : 'Autovarka - Multicookers for Trucks',
      url: `https://autovarka.com.ua/${locale}`,
      images: [
        {
          url: '/images/hero-banner.jpg',
          width: 1200,
          height: 630,
          alt: locale === 'uk' ? 'Автомобільна мультиварка 12/24/220V для далекобійника - Автоварка' : locale === 'ru' ? 'Автомобильная мультиварка 12/24/220V для дальнобойщика - Автоварка' : locale === 'pl' ? 'Multicooker samochodowy 12/24/220V dla kierowcy TIR - Autovarka' : locale === 'de' ? 'Auto-Multikocher 12/24/220V für LKW-Fahrer - Autovarka' : 'Car Multicooker 12/24/220V for Truckers - Autovarka',
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

export default async function LocaleLayout({ children }: Props) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

import { Metadata } from 'next';
import HomeClient from './HomeClient';
import { getPublicCatalog } from '@/lib/catalog';
import { getVideoSettings } from '@/lib/videoSettings';
import { connection } from 'next/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    alternates: {
      canonical: `https://autovarka.com.ua${locale === 'uk' ? '' : `/${locale}`}`,
      languages: {
        'uk': 'https://autovarka.com.ua',
        'ru': 'https://autovarka.com.ua/ru',
        'en': 'https://autovarka.com.ua/en',
        'pl': 'https://autovarka.com.ua/pl',
        'de': 'https://autovarka.com.ua/de',
        'x-default': 'https://autovarka.com.ua',
      },
    },
  };
}

export default async function HomePage() {
  // Keep HTML fresh; only the bounded, validated public data is cached.
  await connection();
  const [catalog, videoSettings] = await Promise.all([getPublicCatalog(), getVideoSettings()]);
  return <HomeClient initialProducts={catalog.products} videoSettings={videoSettings} />;
}

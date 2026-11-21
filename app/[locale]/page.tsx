import type { Metadata } from 'next';
import { getPublicPageMetadata } from '@/lib/pageMetadata';
import HomeClient from './HomeClient';
import { getPublicCatalog } from '@/lib/catalog';
import { getVideoSettings } from '@/lib/videoSettings';
import { connection } from 'next/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return getPublicPageMetadata(locale, 'home');
}

export default async function HomePage() {
  // Keep HTML fresh; only the bounded, validated public data is cached.
  await connection();
  const [catalog, videoSettings] = await Promise.all([getPublicCatalog(), getVideoSettings()]);
  return <HomeClient initialProducts={catalog.products} videoSettings={videoSettings} />;
}

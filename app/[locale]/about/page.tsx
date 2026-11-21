import type { Metadata } from 'next';
import { getPublicPageMetadata } from '@/lib/pageMetadata';
import AboutClient from './AboutClient';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPublicPageMetadata(locale, 'about');
}

export default function AboutPage() {
  return <AboutClient />;
}

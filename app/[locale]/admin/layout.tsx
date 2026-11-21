import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServiceMetadata } from '@/lib/seo';

const titles: Record<string, string> = {
  uk: 'Адміністрування',
  ru: 'Администрирование',
  en: 'Administration',
  pl: 'Administracja',
  de: 'Verwaltung',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getServiceMetadata(locale, titles[locale] || titles.uk);
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

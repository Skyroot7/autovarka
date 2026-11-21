import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { getServiceMetadata } from '@/lib/seo';

const titles: Record<string, string> = {
  uk: 'Профіль',
  ru: 'Профиль',
  en: 'Profile',
  pl: 'Profil',
  de: 'Profil',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getServiceMetadata(locale, titles[locale] || titles.uk);
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

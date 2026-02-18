import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata.products' });

  const localeMap: Record<string, string> = {
    uk: 'uk_UA',
    ru: 'ru_RU',
    en: 'en_US',
    pl: 'pl_PL',
    de: 'de_DE',
  };

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('ogTitle'),
      description: t('ogDescription'),
      url: `https://autovarka.com.ua/${locale}/products`,
      type: 'website',
      locale: localeMap[locale] || 'uk_UA',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitterTitle'),
      description: t('twitterDescription'),
    },
  };
}

export default function ProductsLayout({ children }: Props) {
  return children;
}

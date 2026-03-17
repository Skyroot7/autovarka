import { Metadata } from 'next';
import HomeClient from './HomeClient';

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

export default function HomePage() {
  return <HomeClient />;
}

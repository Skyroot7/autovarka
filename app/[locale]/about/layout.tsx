import { Metadata } from 'next';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    uk: 'Про нас - Автоварка | Мультиварки для Вантажівок',
    ru: 'О нас - Автоварка | Мультиварки для Грузовиков',
    en: 'About Us - Autovarka | Multicookers for Trucks',
    pl: 'O nas - Autovarka | Multicookery dla Ciężarówek',
    de: 'Über uns - Autovarka | Multikocher für LKW',
  };

  const descriptions: Record<string, string> = {
    uk: 'Автоварка - ваш надійний партнер у виборі автомобільних мультиварок. Більше 5 років досвіду. Гарантія якості. Доставка по всій Україні.',
    ru: 'Автоварка - ваш надежный партнер в выборе автомобильных мультиварок. Более 5 лет опыта. Гарантия качества. Доставка по всей Украине.',
    en: 'Autovarka - your reliable partner for car multicookers. Over 5 years of experience. Quality guarantee. Delivery throughout Ukraine.',
    pl: 'Autovarka - Twój niezawodny partner w wyborze multicookerów samochodowych. Ponad 5 lat doświadczenia. Gwarancja jakości. Dostawa w całej Ukrainie.',
    de: 'Autovarka - Ihr zuverlässiger Partner für Auto-Multikocher. Über 5 Jahre Erfahrung. Qualitätsgarantie. Lieferung in der gesamten Ukraine.',
  };

  return {
    title: titles[locale] || titles.uk,
    description: descriptions[locale] || descriptions.uk,
    alternates: {
      canonical: `https://autovarka.com.ua${locale === 'uk' ? '' : `/${locale}`}/about`,
      languages: {
        'uk': 'https://autovarka.com.ua/about',
        'ru': 'https://autovarka.com.ua/ru/about',
        'en': 'https://autovarka.com.ua/en/about',
        'pl': 'https://autovarka.com.ua/pl/about',
        'de': 'https://autovarka.com.ua/de/about',
        'x-default': 'https://autovarka.com.ua/about',
      },
    },
  };
}

export default function AboutLayout({ children }: Props) {
  return children;
}

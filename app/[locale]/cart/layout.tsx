import { Metadata } from 'next';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    uk: 'Кошик - Автоварка | Оформлення замовлення',
    ru: 'Корзина - Автоварка | Оформление заказа',
    en: 'Cart - Autovarka | Checkout',
    pl: 'Koszyk - Autovarka | Finalizacja zamówienia',
    de: 'Warenkorb - Autovarka | Zur Kasse',
  };

  const descriptions: Record<string, string> = {
    uk: '🛒 Ваш кошик з автомобільними мультиварками. Безкоштовна доставка по Україні. Оформлення замовлення за 2 хвилини. Гарантія 6 місяців.',
    ru: '🛒 Ваша корзина с автомобильными мультиварками. Бесплатная доставка по Украине. Оформление заказа за 2 минуты. Гарантия 6 месяцев.',
    en: '🛒 Your cart with car multicookers. Free delivery in Ukraine. Order in 2 minutes. 6 months warranty.',
    pl: '🛒 Twój koszyk z multicookerami samochodowymi. Bezpłatna dostawa na Ukrainie. Zamówienie w 2 minuty. 6 miesięcy gwarancji.',
    de: '🛒 Ihr Warenkorb mit Auto-Multikochern. Kostenlose Lieferung in der Ukraine. Bestellung in 2 Minuten. 6 Monate Garantie.',
  };

  return {
    title: titles[locale] || titles.uk,
    description: descriptions[locale] || descriptions.uk,
    alternates: {
      canonical: `https://autovarka.com.ua${locale === 'uk' ? '' : `/${locale}`}/cart`,
      languages: {
        'uk': 'https://autovarka.com.ua/cart',
        'ru': 'https://autovarka.com.ua/ru/cart',
        'en': 'https://autovarka.com.ua/en/cart',
        'pl': 'https://autovarka.com.ua/pl/cart',
        'de': 'https://autovarka.com.ua/de/cart',
        'x-default': 'https://autovarka.com.ua/cart',
      },
    },
  };
}

export default function CartLayout({ children }: Props) {
  return children;
}

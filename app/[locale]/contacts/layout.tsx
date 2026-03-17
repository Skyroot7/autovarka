import { Metadata } from 'next';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    uk: 'Контакти - Автоварка | Зв\'яжіться з нами',
    ru: 'Контакты - Автоварка | Свяжитесь с нами',
    en: 'Contacts - Autovarka | Get in Touch',
    pl: 'Kontakt - Autovarka | Skontaktuj się z nami',
    de: 'Kontakt - Autovarka | Kontaktieren Sie uns',
  };

  const descriptions: Record<string, string> = {
    uk: '📞 Зв\'яжіться з Автоварка: +380 63 681 50 90, Viber, info@autovarka.com.ua. Графік роботи Пн-Пт 9:00-20:00. Професійна консультація з автомобільних мультиварок.',
    ru: '📞 Свяжитесь с Автоварка: +380 63 681 50 90, Viber, info@autovarka.com.ua. График работы Пн-Пт 9:00-20:00. Профессиональная консультация по автомобильным мультиваркам.',
    en: '📞 Contact Autovarka: +380 63 681 50 90, Viber, info@autovarka.com.ua. Working hours Mon-Fri 9:00-20:00. Professional consultation on car multicookers.',
    pl: '📞 Skontaktuj się z Autovarka: +380 63 681 50 90, Viber, info@autovarka.com.ua. Godziny pracy Pn-Pt 9:00-20:00. Profesjonalne doradztwo w zakresie multicookerów samochodowych.',
    de: '📞 Kontakt Autovarka: +380 63 681 50 90, Viber, info@autovarka.com.ua. Öffnungszeiten Mo-Fr 9:00-20:00. Professionelle Beratung zu Auto-Multikochern.',
  };

  return {
    title: titles[locale] || titles.uk,
    description: descriptions[locale] || descriptions.uk,
    alternates: {
      canonical: `https://autovarka.com.ua${locale === 'uk' ? '' : `/${locale}`}/contacts`,
      languages: {
        'uk': 'https://autovarka.com.ua/contacts',
        'ru': 'https://autovarka.com.ua/ru/contacts',
        'en': 'https://autovarka.com.ua/en/contacts',
        'pl': 'https://autovarka.com.ua/pl/contacts',
        'de': 'https://autovarka.com.ua/de/contacts',
        'x-default': 'https://autovarka.com.ua/contacts',
      },
    },
  };
}

export default function ContactsLayout({ children }: Props) {
  return children;
}

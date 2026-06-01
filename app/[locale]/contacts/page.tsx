import { Metadata } from 'next';
import { generateAlternates } from '@/lib/seo';
import ContactsClient from './ContactsClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    uk: 'Контакти - Автоварка | Зв\'яжіться з нами',
    ru: 'Контакты - Автоварка | Свяжитесь с нами',
    en: 'Contacts - Autovarka | Contact Us',
    pl: 'Kontakt - Autovarka | Skontaktuj się z nami',
    de: 'Kontakt - Autovarka | Kontaktieren Sie uns',
  };

  const descriptions: Record<string, string> = {
    uk: 'Зв\'яжіться з Автоварка. Телефон: +380 63 681 50 90. Viber, Email: info@autovarka.com.ua. Доставка по всій Україні.',
    ru: 'Свяжитесь с Автоварка. Телефон: +380 63 681 50 90. Viber, Email: info@autovarka.com.ua. Доставка по всей Украине.',
    en: 'Contact Autovarka. Phone: +380 63 681 50 90. Viber, Email: info@autovarka.com.ua. Delivery across Ukraine.',
    pl: 'Skontaktuj się z Autovarka. Telefon: +380 63 681 50 90. Viber, Email: info@autovarka.com.ua.',
    de: 'Kontaktieren Sie Autovarka. Telefon: +380 63 681 50 90. Viber, Email: info@autovarka.com.ua.',
  };

  return {
    title: titles[locale] || titles.uk,
    description: descriptions[locale] || descriptions.uk,
    alternates: generateAlternates(locale, '/contacts'),
  };
}

export default function ContactsPage() {
  return <ContactsClient />;
}

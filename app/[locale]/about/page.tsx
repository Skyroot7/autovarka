import { Metadata } from 'next';
import { generateAlternates } from '@/lib/seo';
import { getFAQSchema } from '@/lib/structuredData';
import StructuredData from '@/components/StructuredData';
import AboutClient from './AboutClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    uk: 'Про нас - Автоварка | Автомобільні мультиварки 12-24V',
    ru: 'О нас - Автоварка | Автомобильные мультиварки 12-24V',
    en: 'About Us - Autovarka | Car Multicookers 12-24V',
    pl: 'O nas - Autovarka | Multicookery samochodowe 12-24V',
    de: 'Über uns - Autovarka | Auto-Multikocher 12-24V',
  };

  const descriptions: Record<string, string> = {
    uk: 'Дізнайтесь більше про Автоварка - провідний постачальник автомобільних мультиварок в Україні. Якість, гарантія, швидка доставка по всій Україні.',
    ru: 'Узнайте больше об Автоварка - ведущем поставщике автомобильных мультиварок в Украине. Качество, гарантия, быстрая доставка по всей Украине.',
    en: 'Learn more about Autovarka - the leading supplier of car multicookers in Ukraine. Quality, warranty, fast delivery across Ukraine.',
    pl: 'Dowiedz się więcej o Autovarka - wiodącym dostawcy multicookerów samochodowych na Ukrainie. Jakość, gwarancja, szybka dostawa.',
    de: 'Erfahren Sie mehr über Autovarka - den führenden Anbieter von Auto-Multikochern in der Ukraine. Qualität, Garantie, schnelle Lieferung.',
  };

  return {
    title: titles[locale] || titles.uk,
    description: descriptions[locale] || descriptions.uk,
    alternates: generateAlternates(locale, '/about'),
  };
}

export default function AboutPage() {
  const faqSchema = getFAQSchema();
  return (
    <>
      <StructuredData data={[faqSchema]} />
      <AboutClient />
    </>
  );
}

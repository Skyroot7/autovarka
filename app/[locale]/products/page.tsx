import { Metadata } from 'next';
import { generateAlternates } from '@/lib/seo';
import ProductsClient from './ProductsClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    uk: 'Каталог товарів - Автомобільні мультиварки 12-24V | Автоварка',
    ru: 'Каталог товаров - Автомобильные мультиварки 12-24V | Автоварка',
    en: 'Products Catalog - Car Multicookers 12-24V | Autovarka',
    pl: 'Katalog produktów - Multicookery samochodowe 12-24V | Autovarka',
    de: 'Produktkatalog - Auto-Multikocher 12-24V | Autovarka',
  };

  const descriptions: Record<string, string> = {
    uk: 'Каталог автомобільних мультиварок 12В, 24В, 220В для вантажівок, фур та легкових автомобілів. Широкий вибір, гарантія 6 місяців, доставка по всій Україні.',
    ru: 'Каталог автомобильных мультиварок 12В, 24В, 220В для грузовиков, фур и легковых автомобилей. Широкий выбор, гарантия 6 месяцев, доставка по всей Украине.',
    en: 'Catalog of car multicookers 12V, 24V, 220V for trucks and passenger cars. Wide selection, 6 months warranty, delivery across Ukraine.',
    pl: 'Katalog multicookerów samochodowych 12V, 24V, 220V dla ciężarówek i samochodów osobowych. Szeroki wybór, gwarancja 6 miesięcy.',
    de: 'Katalog der Auto-Multikocher 12V, 24V, 220V für LKW und PKW. Große Auswahl, 6 Monate Garantie, Lieferung in der Ukraine.',
  };

  return {
    title: titles[locale] || titles.uk,
    description: descriptions[locale] || descriptions.uk,
    alternates: generateAlternates(locale, '/products'),
  };
}

export default function ProductsPage() {
  return <ProductsClient />;
}

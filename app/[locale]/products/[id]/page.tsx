import { getProductsFromFile } from '@/lib/productActions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailsClient from './ProductDetailsClient';
import StructuredData from '@/components/StructuredData';
import { getProductSchema, getBreadcrumbSchema } from '@/lib/structuredData';
import { generateAlternates } from '@/lib/seo';

// Разрешить динамические параметры
export const dynamicParams = true;

// Отключить кеширование - всегда показывать актуальные данные
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string; locale: string }> }
): Promise<Metadata> {
  const { id, locale } = await params;
  const products = await getProductsFromFile();
  const product = products.find(p => p.id === id);

  if (!product) {
    return {
      title: 'Товар не знайдено',
    };
  }

  const getName = () => {
    switch (locale) {
      case 'en': return product.nameEn;
      case 'ru': return product.nameRu;
      case 'pl': return product.namePl;
      case 'de': return product.nameDe;
      default: return product.name;
    }
  };

  const getDescription = () => {
    switch (locale) {
      case 'en': return product.descriptionEn;
      case 'ru': return product.descriptionRu;
      case 'pl': return product.descriptionPl;
      case 'de': return product.descriptionDe;
      default: return product.description;
    }
  };

  const titleSuffixes: Record<string, string> = {
    uk: `${product.price}₴ | Купити з Доставкою | Автоварка`,
    ru: `${product.price}₴ | Купить с Доставкой | Автоварка`,
    en: `${product.price}₴ | Buy with Delivery | Autovarka`,
    pl: `${product.price}₴ | Kup z Dostawą | Autovarka`,
    de: `${product.price}₴ | Kaufen mit Lieferung | Autovarka`,
  };

  const descSuffixes: Record<string, string> = {
    uk: '✅ Гарантія 6 місяців. 🚚 Доставка по Україні. ⚡ Для далекобійників та вантажівок.',
    ru: '✅ Гарантия 6 месяцев. 🚚 Доставка по Украине. ⚡ Для дальнобойщиков и грузовиков.',
    en: '✅ 6 months warranty. 🚚 Delivery across Ukraine. ⚡ For truck drivers.',
    pl: '✅ Gwarancja 6 miesięcy. 🚚 Dostawa po Ukrainie. ⚡ Dla kierowców TIR.',
    de: '✅ 6 Monate Garantie. 🚚 Lieferung in der Ukraine. ⚡ Für LKW-Fahrer.',
  };

  const keywordsByLocale: Record<string, string[]> = {
    uk: ['мультиварка 24 вольта', 'автомобільна мультиварка', 'мультиварка для далекобійника', 'мультиварка 12/24/220', 'мультиварка для вантажівки', getName(), `${getName()} купити`, `${getName()} ціна`],
    ru: ['мультиварка 24 вольта', 'автомобильная мультиварка', 'мультиварка для дальнобойщика', 'мультиварка 12/24/220', 'мультиварка для грузовика', getName(), `${getName()} купить`, `${getName()} цена`],
    en: ['car multicooker', 'truck multicooker', '24v multicooker', 'multicooker for truck driver', getName(), `buy ${getName()}`, `${getName()} price`],
    pl: ['multicooker samochodowy', 'multicooker 24v', 'multicooker dla kierowcy TIR', getName(), `kup ${getName()}`],
    de: ['Auto-Multikocher', 'LKW-Multikocher', '24V Multikocher', 'Multikocher für LKW-Fahrer', getName()],
  };

  return {
    title: `${getName()} - ${titleSuffixes[locale] || titleSuffixes.uk}`,
    description: `${getName()} - ${product.price}₴. ${getDescription().substring(0, 100)}... ${descSuffixes[locale] || descSuffixes.uk}`,
    keywords: keywordsByLocale[locale] || keywordsByLocale.uk,
    openGraph: {
      title: getName(),
      description: getDescription().substring(0, 160),
      images: product.images.map(img => ({
        url: `https://autovarka.com.ua${img}`,
        width: 450,
        height: 450,
        alt: getName(),
      })),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: getName(),
      description: getDescription().substring(0, 160),
      images: [`https://autovarka.com.ua${product.images[0]}`],
    },
    alternates: generateAlternates(locale, `/products/${id}`),
  };
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;
  const products = await getProductsFromFile();
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  const breadcrumbLabels: Record<string, { home: string; catalog: string }> = {
    uk: { home: 'Головна', catalog: 'Товари' },
    ru: { home: 'Главная', catalog: 'Товары' },
    en: { home: 'Home', catalog: 'Products' },
    pl: { home: 'Strona główna', catalog: 'Produkty' },
    de: { home: 'Startseite', catalog: 'Produkte' },
  };
  const labels = breadcrumbLabels[locale] || breadcrumbLabels.uk;

  const productName = locale === 'en' ? product.nameEn : locale === 'ru' ? product.nameRu : locale === 'pl' ? product.namePl : locale === 'de' ? product.nameDe : product.name;

  const productSchema = getProductSchema(product, locale);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: labels.home, url: locale === 'uk' ? '/' : `/${locale}` },
    { name: labels.catalog, url: locale === 'uk' ? '/products' : `/${locale}/products` },
    { 
      name: productName, 
      url: locale === 'uk' ? `/products/${id}` : `/${locale}/products/${id}` 
    },
  ]);

  return (
    <>
      <StructuredData data={[productSchema, breadcrumbSchema]} />
      <ProductDetailsClient product={product} />
    </>
  );
}

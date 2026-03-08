import { getProductsFromFile } from '@/lib/productActions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailsClient from './ProductDetailsClient';
import StructuredData from '@/components/StructuredData';
import { getProductSchema, getBreadcrumbSchema } from '@/lib/structuredData';

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

  return {
    title: `${getName()} - ${product.price}₴ | Купити з Доставкою | Автоварка`,
    description: `🚗 ${getName()} - ${product.price}₴. ${getDescription().substring(0, 100)}... ✅ Гарантія 6 місяців. 🚚 Доставка по Україні. ⚡ Для далекобійників та вантажівок.`,
    keywords: [
      'мультиварка 24 вольта',
      'автомобильная мультиварка',
      'мультиварка для дальнобойщика',
      'мультиварка 12/24/220',
      'мультиварка автомобільна',
      'мультиварка для вантажівки',
      'мультиварка для фури',
      getName(),
      `${getName()} купити`,
      `${getName()} ціна`
    ],
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
    alternates: {
      canonical: `https://autovarka.com.ua${locale === 'uk' ? '' : `/${locale}`}/products/${id}`,
      languages: {
        'uk': `https://autovarka.com.ua/products/${id}`,
        'ru': `https://autovarka.com.ua/ru/products/${id}`,
        'en': `https://autovarka.com.ua/en/products/${id}`,
        'pl': `https://autovarka.com.ua/pl/products/${id}`,
        'de': `https://autovarka.com.ua/de/products/${id}`,
        'x-default': `https://autovarka.com.ua/products/${id}`,
      },
    },
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

  // Структурированные данные для SEO
  const productSchema = getProductSchema(product, locale);
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Головна', url: locale === 'uk' ? '/' : `/${locale}` },
    { name: 'Товари', url: locale === 'uk' ? '/products' : `/${locale}/products` },
    { 
      name: product.name, 
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

import { getProductById, getPublicCatalog } from '@/lib/catalog';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailsClient from './ProductDetailsClient';
import StructuredData from '@/components/StructuredData';
import { getProductSchema, getBreadcrumbSchema } from '@/lib/structuredData';
import { getPageMetadata, getProductText, getServiceMetadata } from '@/lib/seo';
import { getBreadcrumbLabels } from '@/lib/pageMetadata';

// Разрешить динамические параметры
export const dynamicParams = true;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string; locale: string }> }
): Promise<Metadata> {
  const { id, locale } = await params;
  await connection();
  const product = await getProductById(id);

  if (!product) {
    return getServiceMetadata(locale, { uk: 'Товар не знайдено', ru: 'Товар не найден', en: 'Product not found', pl: 'Nie znaleziono produktu', de: 'Produkt nicht gefunden' }[locale] || 'Product not found');
  }

  const { name, description } = getProductText(product, locale);
  const excerpt = description.trim().replace(/\s+/g, ' ');
  const summary = excerpt.length <= 160 ? excerpt : excerpt.slice(0, 159).replace(/\s+\S*$/, '') + '…';
  return getPageMetadata({
    locale,
    path: `/products/${id}`,
    title: name,
    description: summary || name,
    images: product.images.map(url => ({ url, alt: name })),
  });
}

export default async function ProductPage({ 
  params 
}: { 
  params: Promise<{ id: string; locale: string }> 
}) {
  const { id, locale } = await params;
  await connection();
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }
  const { products } = await getPublicCatalog();

  const labels = getBreadcrumbLabels(locale);
  const { name: productName } = getProductText(product, locale);

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
      <ProductDetailsClient product={product} relatedProducts={products.filter(item => item.id !== id).slice(0, 3)} />
    </>
  );
}

import { Metadata } from 'next';
import { getPublicPageMetadata, getBreadcrumbLabels } from '@/lib/pageMetadata';
import { getItemListSchema, getBreadcrumbSchema } from '@/lib/structuredData';
import { getPublicCatalog } from '@/lib/catalog';
import { connection } from 'next/server';
import StructuredData from '@/components/StructuredData';
import ProductsClient from './ProductsClient';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return getPublicPageMetadata(locale, 'products');
}

export default async function ProductsPage({ params }: Props) {
  const { locale } = await params;
  await connection();
  const { products } = await getPublicCatalog();
  const itemListSchema = getItemListSchema(products, locale);
  const labels = getBreadcrumbLabels(locale);
  const prefix = locale === 'uk' ? '' : `/${locale}`;
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: labels.home, url: prefix || '/' },
    { name: labels.catalog, url: `${prefix}/products` },
  ]);

  return (
    <>
      <StructuredData data={[itemListSchema, breadcrumbSchema]} />
      <ProductsClient initialProducts={products} />
    </>
  );
}

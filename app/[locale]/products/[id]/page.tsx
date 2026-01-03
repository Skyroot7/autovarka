import { getProductsFromFile } from '@/lib/productActions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailsClient from './ProductDetailsClient';

// Разрешить динамические параметры
export const dynamicParams = true;

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const products = await getProductsFromFile();
  const product = products.find(p => p.id === id);

  if (!product) {
    return {
      title: 'Товар не знайдено',
    };
  }

  return {
    title: `${product.name} - Автоварка`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getProductsFromFile();
  const product = products.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetailsClient product={product} />;
}

import { NextResponse } from 'next/server';
import { getProductsFromFile } from '@/lib/productActions';

export async function GET() {
  try {
    const products = await getProductsFromFile();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}


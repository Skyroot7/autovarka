import { NextResponse } from 'next/server';
import { getProductsFromFile } from '@/lib/productActions';

// Отключить кеширование API - всегда возвращать актуальные данные
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const products = await getProductsFromFile();
    
    // Установить заголовки для отключения кеширования
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}


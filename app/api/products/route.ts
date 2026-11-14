import { NextResponse } from 'next/server';
import { CatalogUnavailableError, getPublicCatalog } from '@/lib/catalog';

// Отключить кеширование API - всегда возвращать актуальные данные
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { products, isFallback } = await getPublicCatalog();
    
    // Установить заголовки для отключения кеширования
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(isFallback ? { 'Warning': '110 - "Recently verified catalog backup"' } : {}),
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Product catalog temporarily unavailable' }, {
      status: error instanceof CatalogUnavailableError ? 503 : 500,
      headers: { 'Cache-Control': 'no-store', 'Retry-After': '30' },
    });
  }
}


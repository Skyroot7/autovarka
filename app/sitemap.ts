import { MetadataRoute } from 'next';
import { getPublicCatalog } from '@/lib/catalog';

// Never persist a partial sitemap generated during a storage outage.
export const dynamic = 'force-dynamic';

const BASE_URL = 'https://autovarka.com.ua';
const LOCALES = ['uk', 'ru', 'en', 'pl', 'de'];

function getUrl(locale: string, path: string = ''): string {
  const cleanPath = path && !path.startsWith('/') ? `/${path}` : path;
  if (locale === 'uk') {
    return `${BASE_URL}${cleanPath}`;
  }
  return `${BASE_URL}/${locale}${cleanPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A recent, validated snapshot is acceptable during a short outage. If no
  // trustworthy snapshot exists, fail the request rather than drop all items.
  const { products } = await getPublicCatalog();

  // Статические страницы (без cart и profile — они приватные)
  const staticRoutes = ['', '/products', '/about', '/contacts'];

  const staticPages: MetadataRoute.Sitemap = [];
  LOCALES.forEach(locale => {
    staticRoutes.forEach(route => {
      staticPages.push({
        url: getUrl(locale, route),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/products' ? 0.9 : 0.8,
      });
    });
  });

  // Страницы товаров — только те что реально есть на сайте
  const productPages: MetadataRoute.Sitemap = [];
  LOCALES.forEach(locale => {
    products.forEach(product => {
      productPages.push({
        url: getUrl(locale, `/products/${product.id}`),
        changeFrequency: 'weekly',
        priority: product.featured ? 0.8 : 0.7,
      });
    });
  });

  return [...staticPages, ...productPages];
}

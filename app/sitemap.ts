import { MetadataRoute } from 'next';
import { products } from '@/lib/products';

const BASE_URL = 'https://autovarka.com.ua';
const LOCALES = ['uk', 'ru', 'en', 'pl', 'de'];

function getUrl(locale: string, path: string = ''): string {
  const cleanPath = path && !path.startsWith('/') ? `/${path}` : path;
  if (locale === 'uk') {
    return `${BASE_URL}${cleanPath}`;
  }
  return `${BASE_URL}/${locale}${cleanPath}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Статические страницы (без cart и profile — они приватные)
  const staticRoutes = ['', '/products', '/about', '/contacts'];

  const staticPages: MetadataRoute.Sitemap = [];
  LOCALES.forEach(locale => {
    staticRoutes.forEach(route => {
      staticPages.push({
        url: getUrl(locale, route),
        lastModified: now,
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : route === '/products' ? 0.9 : 0.8,
      });
    });
  });

  // Страницы товаров
  const productPages: MetadataRoute.Sitemap = [];
  LOCALES.forEach(locale => {
    products.forEach(product => {
      productPages.push({
        url: getUrl(locale, `/products/${product.id}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });

  return [...staticPages, ...productPages];
}

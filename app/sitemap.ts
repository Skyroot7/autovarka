import { MetadataRoute } from 'next';
import { getProductsFromFile } from '@/lib/productActions';

const BASE_URL = 'https://autovarka.com.ua';
// pl/de excluded: Google crawls but does not index them yet (wastes crawl budget)
const LOCALES = ['uk', 'ru', 'en'];

function getUrl(locale: string, path: string = ''): string {
  const cleanPath = path && !path.startsWith('/') ? `/${path}` : path;
  if (locale === 'uk') {
    return `${BASE_URL}${cleanPath}`;
  }
  return `${BASE_URL}/${locale}${cleanPath}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Получаем актуальные товары из productsData.json (включая добавленные через админку)
  const products = await getProductsFromFile();

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

  // Страницы товаров — только те что реально есть на сайте
  const productPages: MetadataRoute.Sitemap = [];
  LOCALES.forEach(locale => {
    products.forEach(product => {
      productPages.push({
        url: getUrl(locale, `/products/${product.id}`),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: product.featured ? 0.8 : 0.7,
      });
    });
  });

  return [...staticPages, ...productPages];
}

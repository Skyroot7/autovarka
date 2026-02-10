import { MetadataRoute } from 'next';
import { products } from '@/lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://autovarka.com.ua';
  
  // Список языков
  const locales = ['uk', 'ru', 'en', 'pl', 'de'];
  
  // Базовые страницы
  const routes = ['', '/products', '/about', '/contacts', '/cart', '/profile'];
  
  // Генерируем URL для всех языков
  const staticPages: MetadataRoute.Sitemap = [];
  
  locales.forEach(locale => {
    routes.forEach(route => {
      // Украинский язык - без префикса
      const url = locale === 'uk' 
        ? `${baseUrl}${route}`
        : `${baseUrl}/${locale}${route}`;
      
      staticPages.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });
  
  // Генерируем URL для всех товаров на всех языках
  const productPages: MetadataRoute.Sitemap = [];
  
  locales.forEach(locale => {
    products.forEach(product => {
      const url = locale === 'uk'
        ? `${baseUrl}/products/${product.id}`
        : `${baseUrl}/${locale}/products/${product.id}`;
      
      productPages.push({
        url,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });
  });
  
  return [...staticPages, ...productPages];
}

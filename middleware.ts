import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'uk',
  localePrefix: 'as-needed', // Украинский без префикса, остальные с префиксом
  localeDetection: false // Отключаем автоопределение языка браузера
});

export const config = {
  // Обрабатываем все маршруты кроме API, статических файлов и Next.js служебных файлов
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};


import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'uk',
  localePrefix: 'as-needed', // Украинский без префикса, остальные с префиксом
  localeDetection: false // Отключаем автоопределение языка браузера
});

export const config = {
  // Exclude API, Next.js internals, and static files with known extensions only
  matcher: ['/((?!api|_next|_vercel|.*\\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|otf|map|xml|txt)).*)']
};


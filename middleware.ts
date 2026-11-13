import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import { NextRequest } from 'next/server';
import { CATALOG_REQUEST_HEADER, isCatalogPage } from './lib/catalogRoutes';

const handleLocale = createMiddleware({
  locales,
  defaultLocale: 'uk',
  localePrefix: 'as-needed', // Украинский без префикса, остальные с префиксом
  localeDetection: false // Отключаем автоопределение языка браузера
});

export default function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(CATALOG_REQUEST_HEADER, isCatalogPage(request.nextUrl.pathname) ? '1' : '0');
  // Preserve next-intl's routing; only provide trusted context to the root layout.
  return handleLocale(new NextRequest(request, { headers }));
}

export const config = {
  // Exclude API, Next.js internals, and static files with known extensions only
  matcher: ['/((?!api|_next|_vercel|.*\\.(?:ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|otf|map|xml|txt)).*)']
};


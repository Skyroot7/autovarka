import type { Metadata } from 'next';
import type { Product } from './products';

export const BASE_URL = 'https://autovarka.com.ua';

// Uploaded Blob images already have an absolute URL; local images do not.
export function getAbsoluteImageUrl(image: string): string {
  const url = new URL(image, BASE_URL);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new TypeError('Product images must use HTTP or HTTPS URLs');
  }
  return url.href;
}

export const LOCALES = ['uk', 'ru', 'en', 'pl', 'de'] as const;
export type Locale = typeof LOCALES[number];

export function getSiteName(locale: string): string {
  return locale === 'uk' || locale === 'ru' ? 'Автоварка' : 'Autovarka';
}

export function getProductText(product: Product, locale: string) {
  switch (locale) {
    case 'en': return { name: product.nameEn, description: product.descriptionEn };
    case 'ru': return { name: product.nameRu, description: product.descriptionRu };
    case 'pl': return { name: product.namePl, description: product.descriptionPl };
    case 'de': return { name: product.nameDe, description: product.descriptionDe };
    default: return { name: product.name, description: product.description };
  }
}

type SocialImage = { url: string; width?: number; height?: number; alt?: string };

/** Supply complete nested metadata: Next does not merge Open Graph fields deeply. */
export function getPageMetadata({ locale, path, title, description, images }: {
  locale: string;
  path: string;
  title: string;
  description: string;
  images?: SocialImage[];
}): Metadata {
  const siteName = getSiteName(locale);
  const fullTitle = `${title} | ${siteName}`;
  const socialImages = (images ?? [{
    url: '/images/hero-banner.jpg', width: 1200, height: 400, alt: title,
  }]).map(image => ({ ...image, url: getAbsoluteImageUrl(image.url) }));
  return {
    // An absolute title prevents an ancestor from appending the brand again.
    title: { absolute: fullTitle },
    description,
    alternates: generateAlternates(locale, path),
    openGraph: {
      type: 'website', title: fullTitle, description,
      url: getLocalizedUrl(locale, path), locale: getOgLocale(locale), siteName,
      images: socialImages,
    },
    twitter: {
      card: 'summary_large_image', title: fullTitle, description, images: socialImages,
    },
  };
}

/** Crawlers must be allowed to fetch service pages in order to read this noindex. */
export function getServiceMetadata(locale: string, title: string): Metadata {
  return {
    title: { absolute: `${title} | ${getSiteName(locale)}` },
    robots: {
      index: false, follow: false,
      googleBot: { index: false, follow: false },
    },
    alternates: null,
    openGraph: null,
    twitter: null,
  };
}

// Получить URL страницы для конкретного языка
export function getLocalizedUrl(locale: string, path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'uk') {
    return `${BASE_URL}${cleanPath === '/' ? '' : cleanPath}`;
  }
  return `${BASE_URL}/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

// Генерация alternates (canonical + hreflang) для Next.js Metadata
export function generateAlternates(locale: string, path: string = '/') {
  const canonical = getLocalizedUrl(locale, path);

  const languages: Record<string, string> = {
    'uk': getLocalizedUrl('uk', path),
    'ru': getLocalizedUrl('ru', path),
    'en': getLocalizedUrl('en', path),
    'pl': getLocalizedUrl('pl', path),
    'de': getLocalizedUrl('de', path),
    'x-default': getLocalizedUrl('uk', path), // украинский как дефолтный
  };

  return { canonical, languages };
}

// Получить имя локали в формате OpenGraph
export function getOgLocale(locale: string): string {
  const map: Record<string, string> = {
    uk: 'uk_UA',
    ru: 'ru_RU',
    en: 'en_US',
    pl: 'pl_PL',
    de: 'de_DE',
  };
  return map[locale] || 'uk_UA';
}

// Получить locale для тега html lang
export function getHtmlLang(locale: string): string {
  const map: Record<string, string> = {
    uk: 'uk',
    ru: 'ru',
    en: 'en',
    pl: 'pl',
    de: 'de',
  };
  return map[locale] || 'uk';
}

// Утилита для генерации SEO метаданных (canonical + hreflang)

const BASE_URL = 'https://autovarka.com.ua';

export const LOCALES = ['uk', 'ru', 'en', 'pl', 'de'] as const;
export type Locale = typeof LOCALES[number];

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

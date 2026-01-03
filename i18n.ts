import { getRequestConfig } from 'next-intl/server';

export const locales = ['uk', 'ru', 'en', 'pl', 'de'] as const;
export type Locale = (typeof locales)[number];

const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && locales.some((locale) => locale === value);

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : 'uk';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});


'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-300 w-full overflow-x-hidden" role="contentinfo">
      <div className="container mx-auto px-4 py-12 max-w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold text-white" aria-label="Логотип Автоварка">
              🚗 Автоварка
            </div>
            <p className="text-sm">
              {t('footerDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Категорії товарів">
            <h3 className="text-white font-bold mb-4">{t('products')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={locale === 'uk' ? '/products' : `/${locale}/products`} className="hover:text-white transition-colors">
                  {t('multivarkas12V')}
                </Link>
              </li>
              <li>
                <Link href={locale === 'uk' ? '/products' : `/${locale}/products`} className="hover:text-white transition-colors">
                  {t('multivarkas24V')}
                </Link>
              </li>
              <li>
                <Link href={locale === 'uk' ? '/products' : `/${locale}/products`} className="hover:text-white transition-colors">
                  {t('accessories')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Customer Service */}
          <nav aria-label="Інформація для клієнтів">
            <h3 className="text-white font-bold mb-4">{t('forCustomers')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={locale === 'uk' ? '/about' : `/${locale}/about`} className="hover:text-white transition-colors">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={locale === 'uk' ? '/contacts' : `/${locale}/contacts`} className="hover:text-white transition-colors">
                  {t('contacts')}
                </Link>
              </li>
              <li>
                <a href="tel:+380636815090" className="hover:text-white transition-colors">
                  +380 63 681 50 90
                </a>
              </li>
            </ul>
          </nav>

          {/* Contact Info */}
          <address className="not-italic">
            <h3 className="text-white font-bold mb-4">{t('contacts')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+380636815090" className="hover:text-white transition-colors" aria-label="Телефонувати за номером +380 63 681 50 90">
                  📞 +380 63 681 50 90
                </a>
              </li>
              <li>
                <a href="viber://chat?number=%2B380636815090" className="hover:text-white transition-colors" aria-label="Написати в Viber">
                  📱 Viber
                </a>
              </li>
              <li>
                <a href="mailto:info@autovarka.com.ua" className="hover:text-white transition-colors" aria-label="Написати на email info@autovarka.com.ua">
                  ✉️ info@autovarka.com.ua
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Автоварка. {t('allRightsReserved')}.</p>
        </div>
      </div>
    </footer>
  );
}


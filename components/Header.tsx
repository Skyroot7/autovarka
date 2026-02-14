'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect, useRef } from 'react';
import { ShoppingCartIcon, MagnifyingGlassIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { products } from '@/lib/products';
import SafeImage from '@/components/SafeImage';

export default function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useCartStore(state => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof products>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Закрытие поиска при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    if (searchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  // Функция поиска товаров
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = products.filter(product => {
      const name = locale === 'en' ? product.nameEn : 
                   locale === 'ru' ? product.nameRu : 
                   locale === 'pl' ? product.namePl : 
                   locale === 'de' ? product.nameDe : product.name;
      
      const description = locale === 'en' ? product.descriptionEn : 
                          locale === 'ru' ? product.descriptionRu : 
                          locale === 'pl' ? product.descriptionPl : 
                          locale === 'de' ? product.descriptionDe : product.description;
      
      return name.toLowerCase().includes(lowerQuery) || 
             description.toLowerCase().includes(lowerQuery);
    });

    setSearchResults(filtered);
  };

  // Переход к товару
  const handleProductClick = (productId: string) => {
    router.push(locale === 'uk' ? `/products/${productId}` : `/${locale}/products/${productId}`);
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Функция для получения пути без locale
  const getPathWithoutLocale = () => {
    // Убираем текущую локаль из пути
    // Например, /ru/products/123 -> /products/123
    // или /products/123 (для uk) -> /products/123
    const pathWithoutLocale = pathname.replace(new RegExp(`^/(${languages.map(l => l.code).join('|')})`), '');
    return pathWithoutLocale || '';
  };

  // Функция для формирования пути с новой локалью
  const getPathWithLocale = (newLocale: string) => {
    const pathWithoutLocale = getPathWithoutLocale();
    // Если новая локаль - украинская (дефолтная), не добавляем префикс
    if (newLocale === 'uk') {
      return pathWithoutLocale || '/';
    }
    // Для других языков добавляем префикс
    return `/${newLocale}${pathWithoutLocale || ''}`;
  };

  const languages = [
    { code: 'uk', name: 'UA' },
    { code: 'ru', name: 'RU' },
    { code: 'en', name: 'EN' },
    { code: 'pl', name: 'PL' },
    { code: 'de', name: 'DE' },
  ];

  return (
    <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg sticky top-0 z-50 w-full overflow-x-hidden" role="banner">
      <div className="container mx-auto px-4 max-w-full">
        <div className="flex items-center justify-between h-16 md:h-20 w-full">
          {/* Logo */}
          <Link href={locale === 'uk' ? '/' : `/${locale}`} className="flex items-center group" aria-label="Перейти на головну сторінку Автоварка">
            <div className="flex flex-row items-center gap-2 group-hover:scale-105 transition-transform">
              <span className="text-3xl md:text-4xl">🚗</span>
              <span className="text-xl md:text-3xl font-bold tracking-tight">Автоварка</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 md:ml-8 lg:ml-12" aria-label="Основна навігація">
            <Link href={locale === 'uk' ? '/' : `/${locale}`} className="hover:text-orange-200 transition-colors font-medium">
              {t('home')}
            </Link>
            <Link href={locale === 'uk' ? '/products' : `/${locale}/products`} className="hover:text-orange-200 transition-colors font-medium">
              {t('products')}
            </Link>
            <Link href={locale === 'uk' ? '/about' : `/${locale}/about`} className="hover:text-orange-200 transition-colors font-medium">
              {t('about')}
            </Link>
            <Link href={locale === 'uk' ? '/contacts' : `/${locale}/contacts`} className="hover:text-orange-200 transition-colors font-medium">
              {t('contacts')}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 shrink-0">
            {/* Phone and Viber - Mobile: только иконки, Desktop: с номером телефона */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
              {/* Phone */}
              <a 
                href="tel:+380636815090"
                className="flex items-center gap-1 md:gap-2 lg:gap-3 px-1.5 sm:px-1 md:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-white/10 transition-all group"
                aria-label="Позвонить +38 (063) 681-50-90"
                title="+38 (063) 681-50-90"
              >
                <svg className="w-5 h-5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {/* Номер телефона показываем только на sm и больше */}
                <span className="hidden sm:inline text-xs md:text-sm lg:text-base font-semibold group-hover:text-orange-100 transition-colors whitespace-nowrap">
                  +38 (063) 681-50-90
                </span>
              </a>
              {/* Viber */}
              <a 
                href="viber://chat?number=%2B380636815090"
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-all group"
                aria-label="Написать в Viber"
                title="Написать в Viber"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 group-hover:scale-110 transition-transform shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.617 6.055 20.29h.005l-.004 2.406s-.037.977.61 1.177c.777.242 1.234-.5 1.977-1.302.41-.442.977-1.093 1.404-1.594 3.856.326 6.82-.42 7.152-.532.77-.26 5.13-.837 5.84-6.833.73-6.17-.437-10.083-3.02-11.832C18.33.41 15.86 0 12.862 0h-.005C12.35-.004 11.875-.008 11.4 0zm.116 1.86c.407-.005.857 0 1.312.008 2.606 0 4.81.36 6.47 1.974 2.155 1.69 2.838 4.942 2.224 9.818-.545 4.35-3.613 4.858-4.228 5.06-.283.095-2.894.743-6.13.49 0 0-2.426 2.924-3.184 3.683-.12.12-.26.167-.352.145-.13-.03-.166-.188-.165-.414l.02-4.004c-4.762-1.338-4.48-6.098-4.426-8.686.054-2.588.567-4.693 1.977-6.105C7.49 2.35 10.94 1.897 11.516 1.86z"/>
                  <path d="M11.5 6.5c.276 0 .5.224.5.5v4.293l1.146-1.147a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 01.708-.708L11 11.293V7a.5.5 0 01.5-.5z"/>
                </svg>
              </a>
            </div>

            {/* Language Switcher */}
            <nav className="hidden md:flex items-center space-x-1" aria-label="Вибір мови">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={getPathWithLocale(lang.code)}
                  className={`px-2 py-1 rounded transition-colors ${
                    locale === lang.code ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
                  }`}
                  aria-label={`Переключити мову на ${lang.name}`}
                  aria-current={locale === lang.code ? 'page' : undefined}
                >
                  {lang.name}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
              aria-label={t('search')}
            >
              <MagnifyingGlassIcon className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* Cart */}
            <Link
              href={locale === 'uk' ? '/cart' : `/${locale}/cart`}
              className="relative p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
              aria-label={t('cart')}
            >
              <ShoppingCartIcon className="h-5 w-5 md:h-6 md:w-6" aria-hidden="true" />
              <span
                className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-opacity ${
                  itemCount > 0 ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden={itemCount === 0}
                suppressHydrationWarning
              >
                {itemCount}
              </span>
            </Link>

            {/* Profile */}
            <Link
              href={locale === 'uk' ? '/profile' : `/${locale}/profile`}
              className="hidden sm:block p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
              aria-label={t('profile')}
            >
              <UserIcon className="h-5 w-5 md:h-6 md:w-6" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label={mobileMenuOpen ? "Закрити меню" : "Відкрити меню"}
              aria-expanded={mobileMenuOpen}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 relative" ref={searchRef}>
            <div className="flex items-center bg-white/10 rounded-lg overflow-hidden">
              <MagnifyingGlassIcon className="h-5 w-5 ml-3 text-white flex-shrink-0" />
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-white placeholder-white/70"
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="px-2 py-2 hover:bg-white/10 transition-colors"
                  aria-label="Очистити пошук"
                >
                  <XMarkIcon className="h-5 w-5 text-white" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchQuery.trim().length >= 2 && (
              <div className="fixed top-32 left-0 right-0 mx-auto max-w-7xl px-4 bg-white rounded-3xl shadow-[0_20px_100px_rgba(0,0,0,0.3)] max-h-[calc(100vh-150px)] overflow-y-auto z-[9999] border-[6px] border-orange-400">
                {searchResults.length > 0 ? (
                  <div className="py-4">
                    {searchResults.map((product) => {
                      const name = locale === 'en' ? product.nameEn : 
                                   locale === 'ru' ? product.nameRu : 
                                   locale === 'pl' ? product.namePl : 
                                   locale === 'de' ? product.nameDe : product.name;
                      
                      return (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="w-full flex items-center gap-6 px-8 py-5 hover:bg-orange-50 transition-all hover:shadow-md text-left border-b-2 border-gray-200 last:border-0 rounded-lg"
                        >
                          <div className="relative w-32 h-32 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-orange-200 shadow-sm">
                            <SafeImage
                              src={product.images[0]}
                              alt={name}
                              fill
                              sizes="128px"
                              className="object-contain p-3"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-xl mb-2 leading-tight">{name}</h4>
                            <p className="text-orange-600 font-bold text-2xl">{product.price} ₴</p>
                            {product.oldPrice && (
                              <p className="text-gray-400 line-through text-base mt-1">{product.oldPrice} ₴</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-8 py-16 text-center text-gray-500">
                    <MagnifyingGlassIcon className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-medium">{locale === 'uk' ? 'Нічого не знайдено' : 
                        locale === 'ru' ? 'Ничего не найдено' : 
                        locale === 'en' ? 'Nothing found' : 
                        locale === 'pl' ? 'Nic nie znaleziono' : 
                        locale === 'de' ? 'Nichts gefunden' : 'Нічого не знайдено'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href={locale === 'uk' ? '/' : `/${locale}`} className="block py-2 hover:text-orange-200 transition-colors">
              {t('home')}
            </Link>
            <Link href={locale === 'uk' ? '/products' : `/${locale}/products`} className="block py-2 hover:text-orange-200 transition-colors">
              {t('products')}
            </Link>
            <Link href={locale === 'uk' ? '/about' : `/${locale}/about`} className="block py-2 hover:text-orange-200 transition-colors">
              {t('about')}
            </Link>
            <Link href={locale === 'uk' ? '/contacts' : `/${locale}/contacts`} className="block py-2 hover:text-orange-200 transition-colors">
              {t('contacts')}
            </Link>
            
            {/* Контакты в мобильном меню */}
            <div className="border-t border-white/20 pt-3 mt-3 space-y-2">
              <a 
                href="tel:+380636815090"
                className="flex items-center gap-3 py-2 hover:text-orange-200 transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-semibold">+38 (063) 681-50-90</span>
              </a>
              <a 
                href="viber://chat?number=%2B380636815090"
                className="flex items-center gap-3 py-2 hover:text-orange-200 transition-colors"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.617 6.055 20.29h.005l-.004 2.406s-.037.977.61 1.177c.777.242 1.234-.5 1.977-1.302.41-.442.977-1.093 1.404-1.594 3.856.326 6.82-.42 7.152-.532.77-.26 5.13-.837 5.84-6.833.73-6.17-.437-10.083-3.02-11.832C18.33.41 15.86 0 12.862 0h-.005C12.35-.004 11.875-.008 11.4 0zm.116 1.86c.407-.005.857 0 1.312.008 2.606 0 4.81.36 6.47 1.974 2.155 1.69 2.838 4.942 2.224 9.818-.545 4.35-3.613 4.858-4.228 5.06-.283.095-2.894.743-6.13.49 0 0-2.426 2.924-3.184 3.683-.12.12-.26.167-.352.145-.13-.03-.166-.188-.165-.414l.02-4.004c-4.762-1.338-4.48-6.098-4.426-8.686.054-2.588.567-4.693 1.977-6.105C7.49 2.35 10.94 1.897 11.516 1.86z"/>
                  <path d="M11.5 6.5c.276 0 .5.224.5.5v4.293l1.146-1.147a.5.5 0 01.708.708l-2 2a.5.5 0 01-.708 0l-2-2a.5.5 0 01.708-.708L11 11.293V7a.5.5 0 01.5-.5z"/>
                </svg>
                <span className="font-semibold">Viber</span>
              </a>
            </div>
            
            <div className="flex items-center space-x-1 pt-2 border-t border-white/20 mt-3">
              {languages.map((lang) => (
                <Link
                  key={lang.code}
                  href={getPathWithLocale(lang.code)}
                  className={`px-2 py-1 rounded transition-colors ${
                    locale === lang.code ? 'bg-white/20 font-bold' : 'hover:bg-white/10'
                  }`}
                >
                  {lang.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


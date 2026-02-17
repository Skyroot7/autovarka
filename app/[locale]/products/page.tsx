'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useProducts } from '@/lib/useProducts';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { translateSpecValue } from '@/lib/specTranslations';

export default function ProductsPage() {
  const t = useTranslations('products');
  const tProduct = useTranslations('product');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { products, loading } = useProducts();
  const [sortBy, setSortBy] = useState<string>('');
  const [filterVoltage, setFilterVoltage] = useState<string>('');

  // Filter and sort products
  let filteredProducts = [...products];
  
  if (filterVoltage) {
    filteredProducts = filteredProducts.filter(p => 
      p.specifications?.voltage === filterVoltage
    );
  }

  if (sortBy) {
    filteredProducts.sort((a, b) => {
      switch(sortBy) {
        case 'priceAsc': return a.price - b.price;
        case 'priceDesc': return b.price - a.price;
        case 'nameAsc': return a.name.localeCompare(b.name);
        case 'nameDesc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-12 border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Фільтри та сортування</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t('filter')}
              </label>
              <div className="relative">
                <select
                  value={filterVoltage}
                  onChange={(e) => setFilterVoltage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="">{tCommon('allProducts')}</option>
                  <option value="12V">12V</option>
                  <option value="24V">24V</option>
                  <option value="12/24V">12/24V</option>
                  <option value="24/220V">24/220V</option>
                  <option value="12/24/220V">12/24/220V</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                {t('sort')}
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all appearance-none bg-white cursor-pointer"
                >
                  <option value="">{t('noSort')}</option>
                  <option value="priceAsc">{t('priceAsc')}</option>
                  <option value="priceDesc">{t('priceDesc')}</option>
                  <option value="nameAsc">{t('nameAsc')}</option>
                  <option value="nameDesc">{t('nameDesc')}</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Знайдено товарів: <span className="font-bold text-orange-600">{filteredProducts.length}</span>
            </p>
            {(filterVoltage || sortBy) && (
              <button
                onClick={() => {
                  setFilterVoltage('');
                  setSortBy('');
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Скинути фільтри
              </button>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : /* Products Grid */
        filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20 bg-white rounded-3xl shadow-xl"
          >
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('noProducts')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {tCommon('tryFilters')}
            </p>
            <button
              onClick={() => {
                setFilterVoltage('');
                setSortBy('');
              }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              Скинути всі фільтри
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border-2 border-gray-100 hover:border-orange-200"
              >
                <div 
                  className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <SafeImage
                    src={product.images[0]}
                    alt={`${product.name} - автомобільна мультиварка ${product.specifications.voltage || ''} для вантажівки та дальнобійщика | ${product.price}₴ | Автоварка`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-8 group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Invisible overlay for extra protection */}
                  <div className="absolute inset-0 pointer-events-auto" 
                       onDragStart={(e) => e.preventDefault()} 
                       onContextMenu={(e) => e.preventDefault()} 
                  />
                  {product.oldPrice && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg pointer-events-none">
                      -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 pointer-events-none">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {tCommon('popular')}
                    </div>
                  )}
                </div>
                
                <div className="p-6 md:p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem] group-hover:text-orange-600 transition-colors">
                    {locale === 'en' ? product.nameEn : 
                     locale === 'ru' ? product.nameRu : 
                     locale === 'pl' ? product.namePl : 
                     locale === 'de' ? product.nameDe : product.name}
                  </h3>
                  
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      {product.price} ₴
                    </span>
                    {product.oldPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {product.oldPrice} ₴
                      </span>
                    )}
                  </div>
                  
                  {/* Specifications */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-5 space-y-2 text-sm">
                    {product.specifications.capacity && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{tProduct('capacity')}: <strong>{translateSpecValue(product.specifications.capacity, locale)}</strong></span>
                      </div>
                    )}
                    {product.specifications.power && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span>{tProduct('power')}: <strong>{translateSpecValue(product.specifications.power, locale)}</strong></span>
                      </div>
                    )}
                    {product.specifications.warranty && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{tProduct('warranty')}: <strong>{translateSpecValue(product.specifications.warranty, locale)}</strong></span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-2 flex-grow">
                    {(locale === 'en' ? product.descriptionEn : 
                      locale === 'ru' ? product.descriptionRu : 
                      locale === 'pl' ? product.descriptionPl : 
                      locale === 'de' ? product.descriptionDe : product.description).substring(0, 100)}...
                  </p>

                  <Link
                    href={locale === 'uk' ? `/products/${product.id}` : `/${locale}/products/${product.id}`}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center py-4 rounded-2xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    {tCommon('viewDetails')}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useProducts } from '@/lib/useProducts';
import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import VideoSection from '@/components/VideoSection';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { products } = useProducts();
  const featuredProducts = products.filter(p => p.featured).sort((a, b) => a.price - b.price);
  const [videoSettings, setVideoSettings] = useState<{ homePageVideoUrl: string; homePageVideoTitle: string }>({ homePageVideoUrl: '', homePageVideoTitle: '' });

  useEffect(() => {
    fetch('/api/videos')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch video settings');
        }
        return res.json();
      })
      .then(data => setVideoSettings(data))
      .catch(err => console.error('Failed to load video settings:', err));
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section with Image Banner */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <SafeImage
            src="/images/hero-banner.jpg"
            alt="Автоварка в кабине грузовика"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="flex items-center h-full">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="inline-block mb-4 bg-orange-500 px-5 py-2 rounded-full shadow-lg"
              >
                <span className="text-xs md:text-sm font-semibold text-white">{t('professionalEquipment')}</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white"
                style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}
              >
                {t('title')}
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg md:text-xl lg:text-2xl mb-3 text-white font-light"
                style={{ textShadow: '1px 1px 6px rgba(0,0,0,0.7), 0 0 15px rgba(0,0,0,0.4)' }}
              >
                {t('subtitle')}
              </motion.p>
              
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm md:text-base lg:text-lg mb-3 text-white max-w-xl leading-relaxed"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
            >
              {t('heroSubtext')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm md:text-base lg:text-lg mb-8 text-orange-200 max-w-xl leading-relaxed font-semibold"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
            >
              🚚 {t('deliveryInfo')}
            </motion.p>
              
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
                <Link
                  href={locale === 'uk' ? '/products' : `/${locale}/products`}
                  className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-2xl hover:shadow-orange-500/50 hover:scale-105 inline-flex items-center gap-2 text-sm md:text-base"
                >
                  {tCommon('products')}
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href={locale === 'uk' ? '/about' : `/${locale}/about`}
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-orange-600 transition-all shadow-lg hover:scale-105 text-sm md:text-base"
                >
                  {tCommon('learnMore')}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: '🛡️', title: t('feature1'), color: 'from-blue-500 to-blue-600' },
              { icon: '🚚', title: t('feature2'), color: 'from-green-500 to-green-600' },
              { icon: '👨‍💼', title: t('feature3'), color: 'from-purple-500 to-purple-600' },
              { icon: '✅', title: t('feature4'), color: 'from-orange-500 to-orange-600' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-3 lg:gap-4 p-4 lg:p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl lg:text-3xl shadow-md`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm lg:text-base font-bold text-gray-900 leading-tight">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {t('productsTitle')}
              </h2>
              <p className="text-gray-600">
                {t('popularProductsSubtitle')}
              </p>
            </div>
            <Link
              href={locale === 'uk' ? '/products' : `/${locale}/products`}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {t('seeAll')}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border-2 border-gray-100 hover:border-orange-200"
              >
                <div 
                  className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden select-none"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <SafeImage
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-8 group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Invisible overlay for extra protection */}
                  <div className="absolute inset-0 pointer-events-auto" 
                       onDragStart={(e) => e.preventDefault()} 
                       onContextMenu={(e) => e.preventDefault()} 
                  />
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
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                      {product.price} ₴
                    </span>
                    {product.oldPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {product.oldPrice} ₴
                      </span>
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
        </div>
      </section>

      {/* Video Section */}
      {videoSettings.homePageVideoUrl && (
        <VideoSection 
          videoUrl={videoSettings.homePageVideoUrl} 
          title={videoSettings.homePageVideoTitle}
        />
      )}

      {/* CTA Section */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/95 max-w-3xl mx-auto font-light">
              {t('ctaDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              <a
                href="tel:+380636815090"
                className="group bg-white text-orange-600 px-10 py-5 rounded-2xl font-bold hover:bg-orange-50 transition-all shadow-2xl hover:shadow-white/20 hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +380 63 681 50 90
              </a>
              <Link
                href={locale === 'uk' ? '/contacts' : `/${locale}/contacts`}
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white px-10 py-5 rounded-2xl font-bold hover:bg-white hover:text-orange-600 transition-all shadow-lg hover:shadow-white/20 hover:scale-105 inline-flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('contactUs')}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}


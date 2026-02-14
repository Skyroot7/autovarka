'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Product, products } from '@/lib/products';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { translateSpecValue } from '@/lib/specTranslations';
import VideoSection from '@/components/VideoSection';

export default function ProductDetailsClient({ product }: { product: Product }) {
  const t = useTranslations('product');
  const tCommon = useTranslations('common');
  const tHome = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const addItem = useCartStore(state => state.addItem);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [currentImageUrl, setCurrentImageUrl] = useState(product.images[0]);

  const handleImageClick = (idx: number) => {
    setSelectedImage(idx);
    setCurrentImageUrl(product.images[idx]);
  };

  const handleAddToCart = () => {
    const productName = locale === 'en' ? product.nameEn : 
                        locale === 'ru' ? product.nameRu : 
                        locale === 'pl' ? product.namePl : 
                        locale === 'de' ? product.nameDe : product.name;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: productName,
        price: product.price,
        image: product.images[0],
      });
    }
    alert('Товар додано до кошика!');
  };

  const handleBuyNow = () => {
    const productName = locale === 'en' ? product.nameEn : 
                        locale === 'ru' ? product.nameRu : 
                        locale === 'pl' ? product.namePl : 
                        locale === 'de' ? product.nameDe : product.name;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: productName,
        price: product.price,
        image: product.images[0],
      });
    }
    // Redirect to cart
    router.push(locale === 'uk' ? '/cart' : `/${locale}/cart`);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href={locale === 'uk' ? '/' : `/${locale}`} className="text-orange-600 hover:text-orange-700">
            {tCommon('home')}
          </Link>
          <span className="mx-2">/</span>
          <Link href={locale === 'uk' ? '/products' : `/${locale}/products`} className="text-orange-600 hover:text-orange-700">
            {tCommon('products')}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-500">
            {locale === 'en' ? product.nameEn : 
             locale === 'ru' ? product.nameRu : 
             locale === 'pl' ? product.namePl : 
             locale === 'de' ? product.nameDe : product.name}
          </span>
        </nav>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Images */}
            <div>
              <div 
                className="relative aspect-square sm:aspect-[4/3] w-full min-h-[20rem] lg:min-h-[28rem] bg-white rounded-lg mb-4 select-none"
                onContextMenu={(e) => e.preventDefault()}
              >
                <SafeImage
                  key={currentImageUrl}
                  src={currentImageUrl}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-10"
                />
                {/* Invisible overlay for extra protection */}
                <div className="absolute inset-0 pointer-events-auto" 
                     onDragStart={(e) => e.preventDefault()} 
                     onContextMenu={(e) => e.preventDefault()} 
                />
                {product.oldPrice && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold pointer-events-none">
                    Знижка {Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
                {product.images.map((image, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleImageClick(idx)}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`relative h-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 cursor-pointer bg-white select-none ${
                      selectedImage === idx 
                        ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' 
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <SafeImage
                      src={image}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      sizes="96px"
                      className="object-contain p-2"
                    />
                    {selectedImage === idx && (
                      <div className="absolute inset-0 bg-orange-500/10 pointer-events-none"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {locale === 'en' ? product.nameEn : 
                 locale === 'ru' ? product.nameRu : 
                 locale === 'pl' ? product.namePl : 
                 locale === 'de' ? product.nameDe : product.name}
              </h1>
              
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4 mb-6">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-600">
                  {product.price} ₴
                </span>
                {product.oldPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    {product.oldPrice} ₴
                  </span>
                )}
              </div>

              <div className="mb-6">
                <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold mb-4">
                  ✓ {t('inStock')}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100/50 border-l-4 border-orange-500 p-4 rounded-lg">
                <p className="text-orange-800 font-semibold flex items-center gap-2">
                  <span className="text-xl">🚚</span>
                  {tHome('deliveryInfo')}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {product.specifications.voltage && (
                  <div className="text-gray-700">
                    <strong>{t('voltage')}:</strong> {translateSpecValue(product.specifications.voltage, locale)}
                  </div>
                )}
                {product.specifications.power && (
                  <div className="text-gray-700">
                    <strong>{t('power')}:</strong> {translateSpecValue(product.specifications.power, locale)}
                  </div>
                )}
                {product.specifications.capacity && (
                  <div className="text-gray-700">
                    <strong>{t('capacity')}:</strong> {translateSpecValue(product.specifications.capacity, locale)}
                  </div>
                )}
                {product.specifications.weight && (
                  <div className="text-gray-700">
                    <strong>{t('weight')}:</strong> {translateSpecValue(product.specifications.weight, locale)}
                  </div>
                )}
                {product.specifications.warranty && (
                  <div className="text-gray-700">
                    <strong>{t('warranty')}:</strong> {translateSpecValue(product.specifications.warranty, locale)}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Кількість
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border border-gray-300 rounded-lg py-2"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4 max-w-[75%]">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition-colors"
                >
                  {tCommon('addToCart')} ({quantity} шт.)
                </button>
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-orange-100 text-orange-600 py-4 rounded-lg font-bold text-lg hover:bg-orange-200 transition-colors"
                >
                  {tCommon('buyNow')}
                </button>
              </div>

              {/* Guarantee Info */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-[75%]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <strong className="text-gray-900">{t('warrantyTitle')}</strong>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('warrantyDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('description')}
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {locale === 'en' ? product.descriptionEn : 
               locale === 'ru' ? product.descriptionRu : 
               locale === 'pl' ? product.descriptionPl : 
               locale === 'de' ? product.descriptionDe : product.description}
            </p>
          </div>

          {/* Specifications */}
          <div className="border-t border-gray-200 p-8 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('specifications')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(product.specifications).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="bg-white p-4 rounded-lg">
                    <div className="text-sm text-gray-500 uppercase">
                      {t(key as keyof typeof product.specifications)}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {translateSpecValue(value, locale)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Video Section */}
        {product.videoUrl && (
          <div className="mt-12">
            <VideoSection 
              videoUrl={product.videoUrl} 
              title={
                locale === 'en' ? product.videoTitleEn :
                locale === 'ru' ? product.videoTitleRu :
                locale === 'pl' ? product.videoTitlePl :
                locale === 'de' ? product.videoTitleDe :
                product.videoTitle
              }
            />
          </div>
        )}

        {/* Related Products */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {t('related')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products
              .filter(p => p.id !== product.id)
              .slice(0, 3)
              .map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Link href={locale === 'uk' ? `/products/${relatedProduct.id}` : `/${locale}/products/${relatedProduct.id}`}>
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <SafeImage
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {locale === 'en' ? relatedProduct.nameEn : 
                         locale === 'ru' ? relatedProduct.nameRu : 
                         locale === 'pl' ? relatedProduct.namePl : 
                         locale === 'de' ? relatedProduct.nameDe : relatedProduct.name}
                      </h3>
                      <div className="text-2xl font-bold text-orange-600">
                        {relatedProduct.price} ₴
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}


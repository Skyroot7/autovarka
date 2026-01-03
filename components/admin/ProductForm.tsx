'use client';

import { Product } from '@/lib/products';
import { useState } from 'react';
import { uploadImage, deleteImage } from '@/lib/imageActions';
import Image from 'next/image';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Partial<Product>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ProductForm({ product, onSave, onCancel, isSubmitting }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    nameEn: product?.nameEn || '',
    nameRu: product?.nameRu || '',
    price: product?.price || 0,
    oldPrice: product?.oldPrice || 0,
    description: product?.description || '',
    descriptionEn: product?.descriptionEn || '',
    descriptionRu: product?.descriptionRu || '',
    voltage: product?.specifications?.voltage || '',
    capacity: product?.specifications?.capacity || '',
    power: product?.specifications?.power || '',
    weight: product?.specifications?.weight || '',
    warranty: product?.specifications?.warranty || '',
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    videoUrl: product?.videoUrl || '',
    videoTitle: product?.videoTitle || '',
    videoTitleEn: product?.videoTitleEn || '',
    videoTitleRu: product?.videoTitleRu || '',
    videoTitlePl: product?.videoTitlePl || '',
    videoTitleDe: product?.videoTitleDe || '',
  });

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await uploadImage(formData);
      
      if (result.success && result.url) {
        setImages(prev => [...prev, result.url!]);
      } else {
        setUploadError(result.error || 'Помилка завантаження');
      }
    } catch (error) {
      setUploadError('Помилка завантаження зображення');
      console.error(error);
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!confirm('Удалить это изображение?')) return;

    try {
      const result = await deleteImage(imageUrl);
      if (result.success) {
        setImages(prev => prev.filter(img => img !== imageUrl));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Partial<Product> = {
      name: formData.name,
      nameEn: formData.nameEn,
      nameRu: formData.nameRu,
      namePl: product?.namePl || formData.name, // Fallback
      nameDe: product?.nameDe || formData.name, // Fallback
      price: Number(formData.price),
      oldPrice: formData.oldPrice ? Number(formData.oldPrice) : undefined,
      description: formData.description,
      descriptionEn: formData.descriptionEn,
      descriptionRu: formData.descriptionRu,
      descriptionPl: product?.descriptionPl || formData.description, // Fallback
      descriptionDe: product?.descriptionDe || formData.description, // Fallback
      images: images.length > 0 ? images : ['/placeholder.jpg'],
      specifications: {
        voltage: formData.voltage,
        capacity: formData.capacity,
        power: formData.power,
        weight: formData.weight,
        warranty: formData.warranty,
      },
      inStock: formData.inStock,
      featured: formData.featured,
      videoUrl: formData.videoUrl || undefined,
      videoTitle: formData.videoTitle || undefined,
      videoTitleEn: formData.videoTitleEn || undefined,
      videoTitleRu: formData.videoTitleRu || undefined,
      videoTitlePl: formData.videoTitlePl || undefined,
      videoTitleDe: formData.videoTitleDe || undefined,
    };

    onSave(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl p-6 border border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Основная информация
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Название (UK) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Мультиварка 12/24/220В"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Название (EN)
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Multivarka 12/24/220V"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Название (RU)
              </label>
              <input
                type="text"
                value={formData.nameRu}
                onChange={(e) => setFormData({ ...formData, nameRu: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Мультиварка 12/24/220В"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Цена (₴) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="2975"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Старая цена (₴)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.oldPrice}
                onChange={(e) => setFormData({ ...formData, oldPrice: Number(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="3500"
              />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Описание товара
          </h3>
          <div className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Описание (UK) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                placeholder="Детальний опис товару українською мовою..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Описание (EN)
              </label>
              <textarea
                rows={4}
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                placeholder="Detailed product description in English..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Описание (RU)
              </label>
              <textarea
                rows={4}
                value={formData.descriptionRu}
                onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                placeholder="Подробное описание товара на русском языке..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-xl p-6 border border-indigo-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Изображения товара
          </h3>

          {/* Upload Error */}
          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700 font-medium">{uploadError}</p>
            </div>
          )}

          {/* Current Images */}
          {images.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Текущие изображения ({images.length})
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200 bg-white shadow-sm">
                      <Image
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized={imageUrl.startsWith('http')}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImageDelete(imageUrl)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Удалить изображение"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        Главное
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Загрузить новое изображение
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  uploadingImage
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400'
                }`}
              >
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
                    <span className="text-sm font-medium text-gray-600">Загрузка...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-indigo-700">Кликните для выбора</span>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP, GIF (макс. 5MB)</p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl p-6 border border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Характеристики
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Напряжение
              </label>
              <input
                type="text"
                value={formData.voltage}
                onChange={(e) => setFormData({ ...formData, voltage: e.target.value })}
                placeholder="12/24/220V"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Объем
              </label>
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="2 л"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Мощность
              </label>
              <input
                type="text"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: e.target.value })}
                placeholder="120/200/300Вт"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Вес
              </label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="2.5 кг"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Гарантия
              </label>
              <input
                type="text"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                placeholder="6 місяців"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Статус товара
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 transition-all">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">В наличии</span>
                <span className="text-xs text-gray-500">Товар доступний до замовлення</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 transition-all">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <div>
                <span className="text-sm font-semibold text-gray-900 block">Популярный</span>
                <span className="text-xs text-gray-500">Показывать на главной</span>
              </div>
            </label>
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Видео товара
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ссылка на видео YouTube (опционально)
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=XXXXXXXXX"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <p className="mt-2 text-sm text-gray-600">
                Видео будет отображаться внизу страницы товара. Поддерживаются форматы: youtube.com/watch?v=..., youtu.be/...
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Заголовок видео (UK) (опционально)
              </label>
              <input
                type="text"
                value={formData.videoTitle}
                onChange={(e) => setFormData({ ...formData, videoTitle: e.target.value })}
                placeholder="Наприклад: Огляд мультиварки"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Заголовок видео (EN) (опционально)
              </label>
              <input
                type="text"
                value={formData.videoTitleEn}
                onChange={(e) => setFormData({ ...formData, videoTitleEn: e.target.value })}
                placeholder="Example: Multivarka Review"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Заголовок видео (RU) (опционально)
              </label>
              <input
                type="text"
                value={formData.videoTitleRu}
                onChange={(e) => setFormData({ ...formData, videoTitleRu: e.target.value })}
                placeholder="Например: Обзор мультиварки"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Заголовок видео (PL) (опционально)
              </label>
              <input
                type="text"
                value={formData.videoTitlePl}
                onChange={(e) => setFormData({ ...formData, videoTitlePl: e.target.value })}
                placeholder="Przykład: Przegląd multywarki"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Заголовок видео (DE) (опционально)
              </label>
              <input
                type="text"
                value={formData.videoTitleDe}
                onChange={(e) => setFormData({ ...formData, videoTitleDe: e.target.value })}
                placeholder="Beispiel: Multivarka Überprüfung"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              <p className="mt-2 text-sm text-gray-600">
                Если оставить все заголовки пустыми, будет использован автоматический перевод в зависимости от выбранного языка
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t-2 border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-8 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all order-2 sm:order-1"
        >
          Отменить
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transform hover:-translate-y-0.5 transition-all order-1 sm:order-2"
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          )}
          {isSubmitting ? 'Сохранение...' : (product ? '✓ Обновить товар' : '+ Создать товар')}
        </button>
      </div>
    </form>
  );
}


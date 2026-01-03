'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsSettings() {
  const router = useRouter();
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [googleTagManagerId, setGoogleTagManagerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load current settings
    fetch('/api/analytics')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch analytics settings');
        }
        return res.json();
      })
      .then(data => {
        setGoogleAnalyticsId(data.googleAnalyticsId || '');
        setGoogleTagManagerId(data.googleTagManagerId || '');
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleAnalyticsId,
          googleTagManagerId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Настройки успешно сохранены! Обновите страницу для применения изменений.');
      } else {
        setMessage('❌ Ошибка сохранения настроек');
      }
    } catch (error) {
      setMessage('❌ Ошибка сохранения настроек');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/uk/admin')}
            className="text-orange-600 hover:text-orange-700 mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад к панели
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Настройки аналитики
          </h1>
          <p className="text-gray-600">
            Управляйте кодами отслеживания Google Analytics и Google Tag Manager
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Google Analytics */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Google Analytics ID (GA4)
              </label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                placeholder="G-XXXXXXXXXX або UA-XXXXXXXXX-X"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                Пример: G-XXXXXXXXXX (для GA4) или UA-XXXXXXXXX-X (для Universal Analytics)
              </p>
            </div>

            {/* Google Tag Manager */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Google Tag Manager ID
              </label>
              <input
                type="text"
                value={googleTagManagerId}
                onChange={(e) => setGoogleTagManagerId(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                Пример: GTM-XXXXXXX
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Как это работает:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Введите ID Google Analytics для отслеживания посетителей</li>
                  <li>Введите ID Google Tag Manager для управления тегами и конверсиями</li>
                  <li>Коды автоматически добавляются на все страницы сайта</li>
                  <li>После сохранения обновите страницу для применения изменений</li>
                </ul>
              </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-4 rounded-xl ${message.includes('✅') ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение...' : '💾 Сохранить настройки'}
            </button>
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📚 Инструкция
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Где найти Google Analytics ID:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Откройте <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">analytics.google.com</a></li>
                <li>Выберите свой ресурс</li>
                <li>Перейдите в "Администратор" → "Информация о ресурсе"</li>
                <li>Скопируйте ID измерения (например, G-XXXXXXXXXX)</li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Где найти Google Tag Manager ID:</h3>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Откройте <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">tagmanager.google.com</a></li>
                <li>Выберите контейнер</li>
                <li>ID контейнера отображается в верхней части (например, GTM-XXXXXXX)</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


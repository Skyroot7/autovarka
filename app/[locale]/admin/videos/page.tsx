'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VideosManagement() {
  const router = useRouter();
  const [homePageVideoUrl, setHomePageVideoUrl] = useState('');
  const [homePageVideoTitle, setHomePageVideoTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Load current settings
    fetch('/api/videos')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch video settings');
        }
        return res.json();
      })
      .then(data => {
        setHomePageVideoUrl(data.homePageVideoUrl || '');
        setHomePageVideoTitle(data.homePageVideoTitle || '');
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
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homePageVideoUrl,
          homePageVideoTitle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Настройки видео успешно сохранены! Обновите страницу для применения изменений.');
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
          <p className="mt-4 text-gray-600">Загрузка...</p>
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
            Управление видео
          </h1>
          <p className="text-gray-600">
            Добавьте видео с YouTube на главную страницу
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Video URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Ссылка на видео YouTube
              </label>
              <input
                type="text"
                value={homePageVideoUrl}
                onChange={(e) => setHomePageVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=XXXXXXXXX или https://youtu.be/XXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                Поддерживаемые форматы: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
              </p>
            </div>

            {/* Video Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Заголовок видео (опционально)
              </label>
              <input
                type="text"
                value={homePageVideoTitle}
                onChange={(e) => setHomePageVideoTitle(e.target.value)}
                placeholder="Например: Мультиварка 12/24 вольта"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <p className="mt-2 text-sm text-gray-500">
                Если оставить пустым, будет использован автоматический перевод заголовка в зависимости от выбранного языка
              </p>
            </div>

            {/* Preview */}
            {homePageVideoUrl && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Предпросмотр:</h3>
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={homePageVideoUrl.includes('youtube.com/embed/') 
                      ? homePageVideoUrl 
                      : `https://www.youtube.com/embed/${homePageVideoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)?.[1] || ''}`
                    }
                    title="Предпросмотр видео"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Как добавить видео с YouTube:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Откройте видео на YouTube</li>
                    <li>Скопируйте ссылку из адресной строки</li>
                    <li>Вставьте ссылку в поле выше</li>
                    <li>Видео появится внизу главной страницы</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Note about products */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex gap-3">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
                <div className="text-sm text-purple-900">
                  <p className="font-semibold mb-1">Видео для товаров:</p>
                  <p>Чтобы добавить видео к конкретному товару, перейдите в раздел "Товары" и отредактируйте нужный товар. Там есть поле для ссылки на видео.</p>
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
      </div>
    </div>
  );
}


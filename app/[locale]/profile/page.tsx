'use client';

import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const t = useTranslations('profile');

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {t('title')}
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
          <p className="text-gray-600 mb-8">
            {t('comingSoon')}
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">{t('authTitle')}</div>
              <div className="text-sm text-gray-600">
                {t('authDesc')}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">{t('ordersTitle')}</div>
              <div className="text-sm text-gray-600">
                {t('ordersDesc')}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">{t('personalTitle')}</div>
              <div className="text-sm text-gray-600">
                {t('personalDesc')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


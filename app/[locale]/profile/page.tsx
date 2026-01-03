'use client';

import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const tCommon = useTranslations('common');

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {tCommon('profile')}
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
          <p className="text-gray-600 mb-8">
            Функціонал особистого кабінету буде реалізовано пізніше.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Авторизація</div>
              <div className="text-sm text-gray-600">
                Можливість реєстрації та авторизації для збереження історії замовлень
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Історія замовлень</div>
              <div className="text-sm text-gray-600">
                Перегляд всіх ваших попередніх замовлень
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">Особисті дані</div>
              <div className="text-sm text-gray-600">
                Управління контактною інформацією та адресами доставки
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


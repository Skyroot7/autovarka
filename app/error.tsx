'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="uk">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="text-8xl mb-8">⚠️</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Щось пішло не так
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Вибачте за незручності. Сталася помилка під час завантаження сторінки.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors"
              >
                Спробувати ще раз
              </button>
              <Link
                href="/"
                className="bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors inline-block"
              >
                На головну
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


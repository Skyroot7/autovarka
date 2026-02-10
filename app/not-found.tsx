import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - Сторінку не знайдено | Автоварка',
  description: 'Вибачте, сторінку, яку ви шукаєте, не існує. Поверніться на головну сторінку Автоварка.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Анимированная иконка */}
        <div className="mb-8 relative">
          <div className="text-9xl font-bold text-white/20 select-none">404</div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg 
              className="w-32 h-32 text-white animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Заголовок */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Упс! Сторінку не знайдено
        </h1>
        
        {/* Описание */}
        <p className="text-xl text-white/90 mb-8 max-w-md mx-auto">
          Схоже, ви заблукали. Сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-white text-orange-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            На головну
          </Link>

          <Link
            href="/products"
            className="bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Каталог товарів
          </Link>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-12 text-white/70 text-sm">
          <p>Потрібна допомога?</p>
          <a 
            href="tel:+380636815090" 
            className="hover:text-white transition-colors font-semibold"
          >
            +38 (063) 681-50-90
          </a>
        </div>
      </div>
    </div>
  );
}

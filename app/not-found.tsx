import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl mb-8">🔍</div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          404
        </h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">
          Сторінку не знайдено
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.
        </p>
        <Link
          href="/"
          className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors inline-block"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
}


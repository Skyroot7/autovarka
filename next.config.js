const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        // Rewrite для динамических страниц товаров без локали на украинскую версию
        {
          source: '/products/:id',
          destination: '/uk/products/:id',
        },
      ],
    };
  },
};

module.exports = withNextIntl(nextConfig);


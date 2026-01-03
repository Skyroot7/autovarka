import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'preobrazovatel12-220.com.ua',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'autovarka.com.ua',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
};

export default withNextIntl(nextConfig);

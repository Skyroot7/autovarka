import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  experimental: {
    // Raster uploads are capped at 4 MiB by the action. Allow multipart overhead
    // here while remaining below Vercel's request limit for accepted files.
    serverActions: { bodySizeLimit: '5mb' },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
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
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
};

export default withNextIntl(nextConfig);

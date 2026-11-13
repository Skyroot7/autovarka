import type { Metadata, Viewport } from "next";
import { headers } from 'next/headers';
import { getPublicCatalog } from '@/lib/catalog';
import { CATALOG_REQUEST_HEADER } from '@/lib/catalogRoutes';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://autovarka.com.ua'),
  authors: [{ name: "Автоварка" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Run above app/loading.tsx: an unavailable catalog must fail before a 200
  // loading shell is streamed. Private/shop-checkout routes do not depend on it.
  if ((await headers()).get(CATALOG_REQUEST_HEADER) === '1') {
    await getPublicCatalog();
  }
  return children;
}

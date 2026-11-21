import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';
import "../globals.css";
import AnalyticsLoader from "@/components/AnalyticsLoader";
import StructuredData from "@/components/StructuredData";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/structuredData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteName } from "@/lib/seo";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  // Page metadata owns its URL and social previews; the layout supplies no
  // homepage canonical that could leak into service or missing-product pages.
  return { title: { default: getSiteName(locale), template: `%s | ${getSiteName(locale)}` } };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebSiteSchema();
  
  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <StructuredData data={[organizationSchema, websiteSchema]} />
          <Suspense fallback={null}>
            <AnalyticsLoader />
          </Suspense>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

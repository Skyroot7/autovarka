import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Analytics from "@/components/Analytics";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Автоварка - Автомобільні мультиварки 12-24V",
    template: "%s | Автоварка",
  },
  description: "Професійні мультиварки для автомобілів, вантажівок та автобусів. Якісна продукція з гарантією. Доставка по всій Україні.",
  keywords: ["мультиварка автомобільна", "мультиварка 12в", "мультиварка 24в", "мультиварка для фури", "мультиварка для вантажівки", "автоварка", "мультиварка в машину"],
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
  openGraph: {
    title: "Автоварка - Автомобільні мультиварки 12-24V",
    description: "Професійні мультиварки для автомобілів, вантажівок та автобусів",
    type: "website",
    locale: "uk_UA",
    siteName: "Автоварка",
    url: "https://autovarka.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Автоварка - Автомобільні мультиварки 12-24V",
    description: "Професійні мультиварки для автомобілів, вантажівок та автобусів",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} antialiased`}>
        <Analytics />
        {children}
      </body>
    </html>
  );
}

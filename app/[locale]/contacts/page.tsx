import type { Metadata } from 'next';
import { getPublicPageMetadata } from '@/lib/pageMetadata';
import ContactsClient from './ContactsClient';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return getPublicPageMetadata(locale, 'contacts');
}

export default function ContactsPage() {
  return <ContactsClient />;
}

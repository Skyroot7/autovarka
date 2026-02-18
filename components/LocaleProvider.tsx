'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  
  return <>{children}</>;
}

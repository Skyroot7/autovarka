'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type SafeImageProps = Omit<ImageProps, 'src' | 'unoptimized'> & {
  src?: string | null;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK_SRC = '/placeholder.svg';

export default function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  alt,
  onError,
  ...rest
}: SafeImageProps) {
  const normalizedSrc = typeof src === 'string' && src.trim().length > 0
    ? src
    : fallbackSrc;

  // Track a failed source rather than copying the prop into state. A new src
  // from an updated catalog is then shown immediately, without a stale frame.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const currentSrc = failedSrc === normalizedSrc ? fallbackSrc : normalizedSrc;
  let unoptimized = false;
  if (/^https?:\/\//i.test(currentSrc)) {
    try {
      const url = new URL(currentSrc);
      const trustedHost = url.hostname === 'autovarka.com.ua'
        || url.hostname === 'preobrazovatel12-220.com.ua'
        || url.hostname.endsWith('.public.blob.vercel-storage.com');
      // Preserve support for legacy external URLs; trusted image hosts use the
      // Next.js optimizer and its responsive sizes/format negotiation.
      unoptimized = url.protocol !== 'https:' || !trustedHost;
    } catch {
      unoptimized = true;
    }
  }

  return (
    <Image
      {...rest}
      alt={alt}
      src={currentSrc}
      unoptimized={unoptimized}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setFailedSrc(normalizedSrc);
        }
        onError?.(event);
      }}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none',
        MozUserSelect: 'none',
        pointerEvents: 'none',
        ...rest.style
      }}
    />
  );
}



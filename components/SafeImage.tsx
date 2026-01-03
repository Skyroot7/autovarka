'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

type SafeImageProps = Omit<ImageProps, 'src' | 'unoptimized'> & {
  src?: string | null;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK_SRC = '/placeholder.jpg';

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

  const [currentSrc, setCurrentSrc] = useState(normalizedSrc);
  const isRemote = currentSrc.startsWith('http');

  return (
    <Image
      {...rest}
      alt={alt}
      src={currentSrc}
      unoptimized={isRemote}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
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



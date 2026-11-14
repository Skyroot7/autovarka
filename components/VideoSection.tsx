'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import SafeImage from './SafeImage';

interface VideoSectionProps {
  videoUrl: string;
  title?: string;
  posterSrc?: string;
}

function getEmbedUrl(videoUrl: string) {
  const match = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\n?#/]+)/);
  if (!match) return videoUrl;
  return `https://www.youtube.com/embed/${encodeURIComponent(match[1])}?autoplay=1`;
}

function VideoPlayer({ videoUrl, title, posterSrc }: Required<VideoSectionProps>) {
  const [playing, setPlaying] = useState(false);
  const t = useTranslations('home');

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-900" style={{ paddingBottom: '56.25%' }}>
      {playing ? (
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={getEmbedUrl(videoUrl)}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="group absolute inset-0 w-full h-full focus-visible:outline-4 focus-visible:outline-orange-500 focus-visible:outline-offset-[-4px]"
          aria-label={`${t('playVideo')}: ${title}`}
          onClick={() => setPlaying(true)}
        >
          <SafeImage src={posterSrc} alt="" fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover opacity-80" />
          <span className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-24 items-center justify-center rounded-2xl bg-red-600 shadow-lg group-hover:bg-red-500 transition-colors">
              <svg aria-hidden="true" className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
      <noscript>
        <a href={videoUrl} className="absolute inset-0 flex items-center justify-center bg-gray-900/70 text-white text-lg font-semibold">
          {t('playVideo')}: {title}
        </a>
      </noscript>
    </div>
  );
}

export default function VideoSection({ videoUrl, title, posterSrc = '/images/hero-banner.jpg' }: VideoSectionProps) {
  const t = useTranslations('home');
  if (!videoUrl) return null;
  const videoTitle = title || t('videoTitle');

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50 overflow-x-hidden w-full">
      <div className="container mx-auto px-4 max-w-full">
        {videoTitle && (
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{videoTitle}</h2>
          </div>
        )}
        <div className="max-w-5xl mx-auto">
          <VideoPlayer key={videoUrl} videoUrl={videoUrl} title={videoTitle} posterSrc={posterSrc} />
        </div>
      </div>
    </section>
  );
}

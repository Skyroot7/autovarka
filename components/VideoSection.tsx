'use client';

import { useTranslations } from 'next-intl';

interface VideoSectionProps {
  videoUrl: string;
  title?: string;
}

export default function VideoSection({ videoUrl, title }: VideoSectionProps) {
  const t = useTranslations('home');
  
  if (!videoUrl) return null;

  // Extract video ID from YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }

    return url;
  };

  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  // Используем заголовок из настроек админки, если он есть, иначе - из переводов
  const videoTitle = title || t('videoTitle');
  
  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {videoTitle && (
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {videoTitle}
            </h2>
          </div>
        )}
        <div className="max-w-5xl mx-auto">
          <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title={videoTitle}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}


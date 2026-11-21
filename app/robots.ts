import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://autovarka.com.ua';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Permit fetching service HTML so crawlers can see its noindex.
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
